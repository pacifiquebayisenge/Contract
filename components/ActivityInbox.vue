<template>
	<section class="violation-inbox" aria-label="Inbox activity">
		<p v-if="loading" role="status">Loading activity…</p>
		<div v-else-if="errorMessage" role="alert">
			<p>{{ errorMessage }}</p>
			<n-button text @click="loadActivity">Try again</n-button>
		</div>
		<template v-else>
			<p v-if="focusedId && !focusedActivity">This activity is no longer available.</p>
			<p v-if="!activities.length">No activity yet.</p>
			<ol v-else class="activity-list">
				<li
					v-for="item in activities"
					:key="`${item.kind}-${item.id}`"
					class="activity-item"
					:class="{ 'activity-item-highlighted': isFocused(item) }"
				>
					<div class="activity-heading">
						<strong :class="{ 'activity-contract': item.kind === 'contract' }">{{ item.title }}</strong>
						<span v-if="item.amount !== null" class="activity-cost" :class="{ 'activity-reward': item.kind === 'reward' }">
							{{ item.kind === 'reward' ? `+${item.amount}` : item.amount }}
						</span>
					</div>
					<p v-if="item.targetId">Used by {{ userStore.getFullNameById(item.targetId) }}</p>
					<p>{{ item.kind === 'reward' ? 'Given by' : 'Reported by' }}
						{{ userStore.getFullNameById(item.actorId) }}</p>
					<time v-if="item.createdAt" :datetime="item.createdAt">
						{{ formatDateTime(item.createdAt) }}
					</time>
				</li>
			</ol>
		</template>
	</section>
</template>

<script setup lang="ts">
import type { Database } from '~/types/supabase.types'
import { formatDateTime } from '~/utils/formatDate'

type Violation = Database['public']['Tables']['user_events']['Row']
type Reward = Database['public']['Tables']['credit_increases']['Row']
type Activity = {
	id: string
	kind: 'violation' | 'reward' | 'contract'
	title: string
	amount: number | null
	actorId: string
	targetId?: string
	createdAt: string | null
}

const props = defineProps<{ focusedId: string | null; focusedKind: Activity['kind'] }>()
const supabase = useSupabaseClient<Database>()
const userStore = useUserStore()
const user = useSupabaseUser()
const activities = ref<Activity[]>([])
const loading = ref(false)
const errorMessage = ref('')
const focusedActivity = computed(() => activities.value.find(isFocused))
let latestRequest = 0

function violationCreditAmount(amount: number | null) {
	if (amount !== null && amount < 0) return amount

	// Older events stored the count. Apply the standard 100-credit penalty per violation.
	return -100 * (amount !== null && amount > 0 ? amount : 1)
}

function eventQuery(userId: string, kind: 'violation' | 'streak_use') {
	return supabase
		.from('user_events')
		.select('*')
		.eq('event_type', kind)
		.or(`actor_id.eq.${userId},target_id.eq.${userId}`)
}

function rewardQuery(userId: string) {
	return supabase
		.from('credit_increases')
		.select('*')
		.or(`giver_id.eq.${userId},receiver_id.eq.${userId}`)
}

function violationActivity(row: Violation): Activity {
	return {
		id: row.id,
		kind: 'violation',
		title: row.rule_title || 'Contract violation',
		amount: violationCreditAmount(row.amount),
		actorId: row.actor_id,
		createdAt: row.created_at,
	}
}

function rewardActivity(row: Reward): Activity {
	return {
		id: row.id,
		kind: 'reward',
		title: row.description || 'Reward',
		amount: row.amount,
		actorId: row.giver_id,
		createdAt: row.created_at,
	}
}

function contractActivity(row: Violation): Activity {
	const number = row.contract_use_number
	const cost = row.contract_credit_cost
	const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Brussels' })
	const today = row.created_at && formatter.format(new Date(row.created_at)) === formatter.format(new Date())

	return {
		id: row.id,
		kind: 'contract',
		title: number ? `Contract #${number}${today ? ' today' : ''}` : 'Contract used',
		amount: cost && cost > 0 ? -cost : null,
		actorId: row.actor_id,
		targetId: row.target_id,
		createdAt: row.created_at,
	}
}

function isFocused(item: Activity) {
	return item.id === props.focusedId && item.kind === props.focusedKind
}

async function loadActivity() {
	const userId = user.value?.sub
	if (!userId) return

	const request = ++latestRequest
	const { focusedId, focusedKind } = props
	loading.value = true
	errorMessage.value = ''

	try {
		const [violations, rewards, contracts] = await Promise.all([
			eventQuery(userId, 'violation').order('created_at', { ascending: false, nullsFirst: false }).limit(25),
			rewardQuery(userId).order('created_at', { ascending: false }).limit(25),
			eventQuery(userId, 'streak_use').order('created_at', { ascending: false, nullsFirst: false }).limit(25),
		])
		if (violations.error) throw violations.error
		if (rewards.error) throw rewards.error
		if (contracts.error) throw contracts.error

		const recent = [
			...(violations.data ?? []).map(violationActivity),
			...(rewards.data ?? []).map(rewardActivity),
			...(contracts.data ?? []).map(contractActivity),
		].sort((a, b) => {
			const timestamp = (value: string | null) => value ? Date.parse(value) : 0
			return timestamp(b.createdAt) - timestamp(a.createdAt)
		}).slice(0, 25)

		let focused = recent.find(isFocused)
		// Older notifications can point outside the current page of activity.
		if (focusedId && !focused) {
			if (focusedKind === 'reward') {
				const { data, error } = await rewardQuery(userId).eq('id', focusedId).maybeSingle()
				if (error) throw error
				if (data) focused = rewardActivity(data)
			} else {
				const eventType = focusedKind === 'contract' ? 'streak_use' : 'violation'
				const { data, error } = await eventQuery(userId, eventType).eq('id', focusedId).maybeSingle()
				if (error) throw error
				if (data) focused = focusedKind === 'contract' ? contractActivity(data) : violationActivity(data)
			}
		}

		if (request === latestRequest) {
			activities.value = focused ? [focused, ...recent.filter((item) => !isFocused(item))] : recent
		}
	} catch (error) {
		console.error('Failed to load inbox activity:', error)
		if (request === latestRequest) errorMessage.value = 'Could not load activity.'
	} finally {
		if (request === latestRequest) loading.value = false
	}
}

watch([() => props.focusedId, () => props.focusedKind, () => user.value?.sub], loadActivity, { immediate: true })
</script>

<style scoped>
.violation-inbox {
	padding: 1rem 1.25rem 2rem;
}

.activity-list {
	display: grid;
	gap: 0.75rem;
}

.activity-item {
	padding: 1rem;
	border: 1px solid #ddd;
	border-radius: 1rem;
	background: #fff;
	color: #525252;
}

.activity-item-highlighted {
	border-color: var(--theme-color);
	outline: 1px solid var(--theme-color);
}

.activity-heading {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	gap: 0.25rem 0.75rem;
	margin-bottom: 0.35rem;
	color: #262626;
	overflow-wrap: anywhere;
}

.activity-cost {
	color: #ee0b38;
	font-weight: 600;
}
.activity-reward {
	color: #55af7a;
}
.activity-contract {
	color: #cc5200;
}
</style>
