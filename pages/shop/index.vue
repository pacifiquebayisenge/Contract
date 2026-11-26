<template>
	<section class="shop">
		<header class="shop-header">
			<h1>{{ userStore.profile?.firstname || 'Shop' }}</h1>
			<span v-if="balance !== null">{{ balance.toLocaleString() }} credits</span>
		</header>

		<div class="shop-tabs" role="group" aria-label="Shop views">
			<button type="button" class="button-3D shop-button shop-aqua" :aria-pressed="view === 'open'" @click="view = 'open'">
				<ShoppingBagIcon aria-hidden="true" /> Available
			</button>
			<button type="button" class="button-3D shop-button shop-owed" :aria-pressed="view === 'accepted'" @click="view = 'accepted'">
				<ClockIcon aria-hidden="true" /> Owed
			</button>
			<button type="button" class="button-3D shop-button shop-blue" :aria-pressed="view === 'completed'" @click="view = 'completed'">
				<CheckCircleIcon aria-hidden="true" /> Completed
			</button>
			<button type="button" class="button-3D shop-button shop-refresh" :disabled="loading || busy" @click="loadShop">
				<ArrowPathIcon aria-hidden="true" /> Refresh
			</button>
		</div>

		<p v-if="loading" role="status">Loading Shop…</p>
		<div v-if="error" role="alert">
			{{ error }}
			<button v-if="loadFailed" type="button" class="button-3D shop-button shop-refresh" @click="loadShop">Try again</button>
		</div>
		<p v-if="!loading && !loadFailed && !visibleItems.length">{{ emptyMessages[view] }}</p>
		<n-card v-for="item in visibleItems" :key="item.id" class="shop-item" :bordered="true" :class="{ 'shop-item-focused': item.id === focusedItemId }">
			<button
				type="button"
				class="shop-item-details"
				:disabled="busy"
				:aria-expanded="confirming === item.id"
				@click="confirming = confirming === item.id ? null : item.id"
			>
				<strong class="shop-item-title">{{ item.title }}</strong>
				<span class="shop-meta">
					<time :datetime="item.created_at">{{ formatDateTime(item.created_at) }}</time>
					<span>·</span>
					<span>{{ personName(item.creator_id) }}</span>
				</span>
			</button>
			<n-collapse-transition :show="confirming === item.id">
				<div class="shop-expanded">
					<p class="shop-description">{{ item.description }}</p>
					<div v-if="item.status === 'open' && item.creator_id === userId" class="shop-owner-actions">
						<button type="button" class="button-3D shop-button shop-new" :disabled="busy" @click="openEdit(item)">Edit</button>
						<n-popconfirm @positive-click="applyAction(item, 'withdraw')">
							<template #trigger>
								<button type="button" class="button-3D shop-button shop-delete" :disabled="busy">Delete</button>
							</template>
							Remove this item from the Shop?
						</n-popconfirm>
					</div>
					<p class="shop-price">{{ item.price }} credits</p>
					<p v-if="item.status === 'accepted'">To be done by {{ personName(performer(item)) }}</p>
					<div v-if="item.status === 'open' && item.partner_id === userId && confirming === item.id" class="shop-confirmation">
						<p v-if="item.kind === 'undecided'">Choose who will do it. The other person pays {{ item.price }} credits.</p>
						<p v-else>{{ item.kind === 'offer' ? 'You' : 'Your partner' }} will spend {{ item.price }} credits.</p>
						<button type="button" class="button-3D shop-button shop-refresh" :disabled="busy" @click="confirming = null">Cancel</button>
						<button type="button" class="button-3D shop-button shop-owed" :disabled="busy" @click="applyAction(item, 'accept')">
							{{ item.kind === 'request' ? 'Accept request' : 'Buy' }}
						</button>
						<button v-if="item.kind === 'undecided'" type="button" class="button-3D shop-button shop-aqua" :disabled="busy" @click="applyAction(item, 'propose')">I can do it</button>
					</div>
					<div v-if="item.status === 'proposed'" class="shop-confirmation">
						<p>{{ item.creator_id === userId ? `Your partner offered to do it. Accept for ${item.price} credits?` : 'Waiting for your partner to confirm.' }}</p>
						<button v-if="item.creator_id === userId" type="button" class="button-3D shop-button shop-owed" :disabled="busy" @click="applyAction(item, 'approve')">Accept and pay</button>
						<button type="button" class="button-3D shop-button shop-refresh" :disabled="busy" @click="applyAction(item, 'decline')">{{ item.creator_id === userId ? 'Decline' : 'Cancel proposal' }}</button>
					</div>
					<button type="button" class="button-3D shop-button shop-aqua" v-if="item.status === 'accepted' && performer(item) === userId" :disabled="busy" @click="applyAction(item, 'complete')">Mark as done</button>
				</div>
			</n-collapse-transition>
		</n-card>
		<ShopItemModal v-model:show="showEdit" :item="editingItem" />
	</section>
</template>

<script setup lang="ts">
import { ArrowPathIcon, CheckCircleIcon, ClockIcon, ShoppingBagIcon } from '@heroicons/vue/24/outline'
import type { Database } from '~/types/supabase.types'
import { useCreditStore } from '~/stores/credit'
import { useUserStore } from '~/stores/user'
import { formatDateTime } from '~/utils/formatDate'

type Item = Database['public']['Tables']['shop_items']['Row']
type ShopView = 'open' | 'accepted' | 'completed'
type Action = Database['public']['Functions']['apply_shop_action']['Args']['p_action']

const supabase = useSupabaseClient<Database>()
const route = useRoute()
const focusedItemId = computed(() => {
	const id = route.query.item
	return typeof id === 'string' && /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id) ? id : null
})
const user = useSupabaseUser()
const userStore = useUserStore()
const creditStore = useCreditStore()
const userId = computed(() => user.value?.sub)
const balance = computed(() => userStore.profile?.credit ?? null)
const items = ref<Item[]>([])
const view = ref<ShopView>('open')
const confirming = ref<string | null>(null)
const showEdit = ref(false)
const editingItem = ref<Item>()

function openEdit(item: Item) {
	editingItem.value = item
	showEdit.value = true
}

const shopRevision = useState('shop-revision', () => 0)
const loading = ref(false)
const loadFailed = ref(false)
const busy = ref(false)
const error = ref('')
const visibleItems = computed(() => {
	const visible = items.value.filter((item) =>
		item.status === view.value || (view.value === 'open' && item.status === 'proposed'),
	)
	const focused = visible.find((item) => item.id === focusedItemId.value)
	return focused ? [focused, ...visible.filter((item) => item.id !== focused.id)] : visible
})
const emptyMessages: Record<ShopView, string> = {
	open: 'Nothing in the Shop yet.',
	accepted: 'Nothing owed yet.',
	completed: 'Nothing completed yet.',
}

function personName(id: string) {
	return id === userId.value ? 'you' : userStore.getFullNameById(id)
}

function performer(item: Item) {
	return item.kind === 'offer' ? item.creator_id : item.partner_id
}

async function loadShop() {
	const id = userId.value
	if (!id) return

	loading.value = true
	loadFailed.value = false
	error.value = ''
	try {
		const [list, profile] = await Promise.all([
			supabase.from('shop_items').select('*').neq('status', 'withdrawn').order('created_at', { ascending: false }),
			supabase.from('profiles').select('credit').eq('id', id).single(),
		])
		if (userId.value !== id) return
		if (list.error) throw list.error
		items.value = list.data
		if (profile.data && userStore.profile?.id === id) {
			userStore.profile.credit = profile.data.credit
			creditStore.setCredit(profile.data.credit)
		}
	} catch (cause) {
		console.error('Could not load Shop:', cause)
		loadFailed.value = true
		error.value = 'Could not load the Shop.'
	} finally {
		loading.value = false
	}
}

async function applyAction(item: Item, action: Action) {
	if (busy.value) return

	busy.value = true
	error.value = ''
	try {
		const { error: failure } = await supabase.rpc('apply_shop_action_at_price', {
			p_item_id: item.id,
			p_action: action,
			p_expected_price: item.price,
		})
		if (failure) throw failure
		if (action === 'propose') {
			// A notification failure must not undo or resubmit the saved proposal.
			void $fetch('/api/send-notification', {
				method: 'POST',
				body: { shopProposalId: item.id },
			}).catch((error) => console.error('Could not send Shop proposal push:', error))
		}
		confirming.value = null
		if (action === 'accept' || action === 'approve') view.value = 'accepted'
		if (action === 'complete') view.value = 'completed'
		await loadShop()
	} catch (cause) {
		console.error('Could not update Shop item:', cause)
		error.value = typeof cause === 'object' && cause !== null && 'message' in cause && cause.message === 'Not enough credits'
			? 'Not enough credits to accept this item.'
			: 'Could not update this item. It may have changed already.'
	} finally {
		busy.value = false
	}
}

watch([userId, shopRevision, focusedItemId], async () => {
	const id = focusedItemId.value
	await loadShop()
	if (!id || focusedItemId.value !== id) return
	const item = items.value.find((entry) => entry.id === id)
	if (item) confirming.value = item.id
	if (item?.status === 'accepted' || item?.status === 'completed') view.value = item.status
	else view.value = 'open'
}, { immediate: true })
</script>

<style scoped>
.shop {
	height: 100%;
	overflow-y: auto;
	max-width: 42rem;
	margin: 0 auto;
	padding: 1rem 1rem 8rem;
	color: #292929;
}

.shop-header, .shop-tabs, .item-heading, .shop-confirmation {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.shop-header, .item-heading { justify-content: space-between; }
.shop-header h1 { font-size: 1.75rem; font-weight: 700; }
.shop-tabs, .shop-item { margin: 1rem 0; }

.shop-item {
	border-radius: 1.15rem;
	border-color: #e4d9eb;
	background: #fff;
}

.shop-expanded {
	display: grid;
	gap: 0.85rem;
	margin-top: 0.85rem;
	padding-top: 0.85rem;
	border-top: 1px solid #eee5f1;
}

.shop-meta { display: flex; flex-wrap: wrap; gap: 0.3rem 0.55rem; color: #655d69; }
.shop-owner-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; }
.shop-expanded :is(.shop-button, .shop-confirmation) { width: 100%; }
.shop-delete { --shop-top: #fde5eb; --shop-edge: #e9a8bc; --shop-ink: #87344d; }
.shop-price { font-weight: 700; }

.shop-description { white-space: pre-wrap; overflow-wrap: anywhere; max-width: 100%; }
/* The grid and divider share the same available width. */
.shop-header {
	border-bottom: 1px solid #dedee3;
	padding-bottom: 1rem;
}

.shop-tabs {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 0.5rem;
	margin: 1.4rem 0 1.2rem;
}

.shop-tabs .shop-button { width: 100%; min-width: 0; }
.shop-item-focused { border-color: #a182bf; outline: 1px solid #a182bf; }
.shop-item-details { display: grid; width: 100%; gap: 0.55rem; text-align: left; }
.shop-item-title { display: block; font-size: 1.15rem; overflow-wrap: anywhere; }

@media (max-width: 34rem) {
	.shop-tabs .shop-button { flex-direction: column; gap: 0.25rem; padding-inline: 0.2rem; }
}
</style>

<style scoped src="~/assets/css/shop-buttons.css"></style>
