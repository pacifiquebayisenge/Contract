<template>
	<section class="violation-inbox" aria-label="Violation activity">
		<p v-if="loading" role="status">Loading activity…</p>
		<div v-else-if="errorMessage" role="alert">
			<p>{{ errorMessage }}</p>
			<n-button text @click="loadActivity">Try again</n-button>
		</div>
		<template v-else>
			<p v-if="focusedId && !focusedViolation">This violation is no longer available.</p>
			<p v-if="!violations.length">No violations yet.</p>
			<ol v-else class="activity-list">
				<li
					v-for="violation in violations"
					:key="violation.id"
					class="activity-item"
					:class="{ 'activity-item-highlighted': violation.id === focusedId }"
				>
					<div class="activity-heading">
						<strong>{{ violation.rule_title || 'Contract violation' }}</strong>
						<span class="activity-cost">
							{{ violationCreditAmount(violation.amount) }}
						</span>
					</div>
					<p>Reported by {{ userStore.getFullNameById(violation.actor_id) }}</p>
					<time v-if="violation.created_at" :datetime="violation.created_at">
						{{ formatDateTime(violation.created_at) }}
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

const props = defineProps<{ focusedId: string | null }>()
const supabase = useSupabaseClient<Database>()
const userStore = useUserStore()
const user = useSupabaseUser()
const violations = ref<Violation[]>([])
const loading = ref(false)
const errorMessage = ref('')
const focusedViolation = computed(() => violations.value.find(({ id }) => id === props.focusedId))
let latestRequest = 0

function violationCreditAmount(amount: number | null) {
	if (amount !== null && amount < 0) return amount

	// Older events stored the count. Apply the standard 100-credit penalty per violation.
	return -100 * (amount !== null && amount > 0 ? amount : 1)
}

function violationQuery(userId: string) {
	return supabase
		.from('user_events')
		.select('*')
		.eq('event_type', 'violation')
		.or(`actor_id.eq.${userId},target_id.eq.${userId}`)
}

async function loadActivity() {
	const userId = user.value?.sub
	if (!userId) return
	const request = ++latestRequest
	const focusedId = props.focusedId
	loading.value = true
	errorMessage.value = ''

	try {
		const { data, error } = await violationQuery(userId)
			.order('created_at', { ascending: false })
			.limit(25)
		if (error) throw error

		const recent = data ?? []
		let focused = recent.find(({ id }) => id === focusedId)

		// A notification can point to a violation older than the most recent 25.
		if (focusedId && !focused) {
			const { data: older, error: lookupError } = await violationQuery(userId).eq('id', focusedId).maybeSingle()
			if (lookupError) throw lookupError
			focused = older ?? undefined
		}

		if (request === latestRequest) {
			violations.value = focused ? [focused, ...recent.filter(({ id }) => id !== focused.id)] : recent
		}
	} catch (error) {
		console.error('Failed to load violation activity:', error)
		if (request === latestRequest) errorMessage.value = 'Could not load activity.'
	} finally {
		if (request === latestRequest) loading.value = false
	}
}

watch([() => props.focusedId, () => user.value?.sub], loadActivity, { immediate: true })
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
	color: #d03050;
	font-weight: 600;
}
</style>
