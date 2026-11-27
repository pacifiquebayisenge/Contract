<template>
	<section class="shop">
		<header class="shop-header">
			<h1>{{ userStore.profile?.firstname || 'Shop' }}</h1>
			<span v-if="balance !== null" class="shop-balance" :aria-label="`${formatAmount(balance)} credits`">
				<BanknotesIcon aria-hidden="true" />
				<span class="shop-balance-number" aria-hidden="true">
					<span class="shop-balance-width">{{ formatAmount(balance) }}</span>
					<Vue3Countup :number="balance" :more-options="countupOptions" />
				</span>
			</span>
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

		<div class="shop-list">
			<p v-if="loading" role="status">Loading Shop…</p>
			<div v-if="error && !deletingItem" role="alert">
				{{ error }}
				<button v-if="loadFailed" type="button" class="button-3D shop-button shop-refresh" @click="loadShop">Try again</button>
			</div>
			<p v-if="!loading && !loadFailed && !visibleItems.length">{{ emptyMessages[view] }}</p>
			<n-card v-for="(item, index) in visibleItems" :key="item.id" class="shop-item" :bordered="true" :class="{ 'shop-item-focused': item.id === focusedItemId }">
				<div class="shop-card-layout">
					<span class="shop-card-index" aria-hidden="true">{{ index + 1 }}</span>
					<div class="shop-card-content">
						<button
							type="button"
							class="shop-item-details"
							:disabled="busy"
							:aria-expanded="confirming === item.id"
							@click="confirming = confirming === item.id ? null : item.id"
						>
							<span class="shop-title-row">
								<strong class="shop-item-title">{{ item.title }}</strong>
								<strong class="shop-price" :aria-label="`${formatAmount(item.price)} credits`">
									{{ formatAmount(item.price) }}
								</strong>
							</span>
						</button>
						<n-collapse-transition :show="confirming === item.id">
							<div class="shop-expanded">
								<p class="shop-description">{{ item.description }}</p>
								<div v-if="item.status === 'open' && item.creator_id === userId" class="shop-owner-actions">
									<button type="button" class="button-3D shop-button shop-refresh" aria-label="Edit item" :disabled="busy" @click="openEdit(item)">
										<PencilSquareIcon aria-hidden="true" />
									</button>
									<button type="button" class="button-3D shop-button shop-delete" aria-label="Delete item" :disabled="busy" @click="openDelete(item, index + 1)">
										<TrashIcon aria-hidden="true" />
									</button>
								</div>
								<button
									v-if="item.status === 'open' && item.creator_id === userId"
									type="button"
									class="button-3D shop-button shop-buy"
									:disabled="busy"
									@click="applyAction(item, 'buy_own')"
								>
									Buy
								</button>
								<p v-if="item.status === 'accepted'">To be done by {{ personName(performer(item)) }}</p>
								<div v-if="item.status === 'open' && item.partner_id === userId && confirming === item.id" class="shop-confirmation">
									<p v-if="item.kind === 'undecided'">Choose who will do it. The other person pays {{ item.price }} credits.</p>
									<p v-else>{{ item.kind === 'offer' ? 'You' : 'Your partner' }} will spend {{ item.price }} credits.</p>
									<button type="button" class="button-3D shop-button shop-refresh" :disabled="busy" @click="confirming = null">Cancel</button>
									<button type="button" class="button-3D shop-button shop-buy" :disabled="busy" @click="applyAction(item, 'accept')">
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
						<div class="shop-meta">
								<time :datetime="item.created_at">{{ formatTimeAgo(item.created_at) }}</time>
								<span>·</span>
								<span>{{ personName(item.creator_id) }}</span>
						</div>
					</div>
				</div>
			</n-card>
		</div>
		<ShopItemModal v-model:show="showEdit" :item="editingItem" />
		<n-modal
			:show="!!deletingItem"
			:mask-closable="!busy"
			:close-on-esc="!busy"
			transform-origin="center"
			@update:show="closeDelete"
		>
			<div class="shop-delete-modal">
				<n-card class="shop-delete-card" :bordered="false" role="dialog" aria-labelledby="shop-delete-title">
					<template #header>
						<h2 id="shop-delete-title">Delete item</h2>
					</template>
					<div class="shop-delete-body">
						<AvatarIcon mood="shook" :fullname="userStore.getFullname" />
						<div class="shop-delete-copy">
							<p>
								Are you sure you want to delete
								shop item {{ deletingItemNumber }} ???
							</p>
							<p>{{ deletingItem?.title }}</p>
						</div>
						<p v-if="error" role="alert">{{ error }}</p>
						<button type="button" class="button-3D button-3D-colorful-error" :disabled="busy" @click="confirmDelete">
							{{ busy ? 'Deleting…' : 'Delete' }}
						</button>
					</div>
				</n-card>
			</div>
		</n-modal>
	</section>
</template>

<script setup lang="ts">
import { ArrowPathIcon, BanknotesIcon, CheckCircleIcon, ClockIcon, PencilSquareIcon, ShoppingBagIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { Vue3Countup } from 'vue3-countup'
import type { Database } from '~/types/supabase.types'
import { useCreditStore } from '~/stores/credit'
import { useUserStore } from '~/stores/user'
import { formatTimeAgo } from '~/utils/formatDate'

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
const countupOptions = { useEasing: true, useGrouping: true, duration: 2, separator: ' ', decimal: '.' }
const amountFormatter = new Intl.NumberFormat('en-US')
const formatAmount = (amount: number) => amountFormatter.format(amount).replace(/,/g, ' ')
const userId = computed(() => user.value?.sub)
const balance = computed(() => userStore.profile?.credit ?? null)
const items = ref<Item[]>([])
const view = ref<ShopView>('open')
const confirming = ref<string | null>(null)
const showEdit = ref(false)
const editingItem = ref<Item>()
const deletingItem = ref<Item | null>(null)

const deletingItemNumber = ref(0)

function openDelete(item: Item, number: number) {
	deletingItemNumber.value = number
	error.value = ''
	deletingItem.value = item
}

function closeDelete(show: boolean) {
	if (show || busy.value) return
	deletingItem.value = null
	error.value = ''
}

async function confirmDelete() {
	if (deletingItem.value) await applyAction(deletingItem.value, 'withdraw')
}

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

function shopActionError(cause: unknown) {
	const failure = typeof cause === 'object' && cause !== null ? cause : {}
	const code = 'code' in failure ? failure.code : null
	const message = 'message' in failure ? failure.message : null

	if (code === 'PGRST202' || code === '42883') {
		return 'The Shop action is missing from Supabase. Apply the Shop edit migration.'
	}
	if (code === '42703' || code === 'PGRST204' || message === 'This shop action is unavailable') {
		return 'This action is unavailable. Refresh the Shop. If Buy still fails on your own item, verify the Shop purchases migration.'
	}
	if (message === 'Not enough credits') return 'Not enough credits to buy this item.'
	if (message === 'The Shop item changed. Refresh before trying again.') return message
	if (code === '42501') return 'The database denied this Shop action. Check your session and Shop permissions.'
	return 'Could not update this item. See the browser console for the database error.'
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
		if (action === 'withdraw') deletingItem.value = null
		if (['propose', 'accept', 'approve', 'buy_own'].includes(action)) {
			// A notification failure must not undo or resubmit the saved proposal.
			void $fetch('/api/send-notification', {
				method: 'POST',
				body: action === 'propose'
					? { shopProposalId: item.id }
					: { shopItemId: item.id, shopAction: 'purchased' },
			}).catch((error) => console.error('Could not send Shop push:', error))
		}
		confirming.value = null
		if (action === 'accept' || action === 'approve' || action === 'buy_own') view.value = 'accepted'
		if (action === 'complete') view.value = 'completed'
		await loadShop()
	} catch (cause) {
		console.error('Could not update Shop item:', cause)
		error.value = shopActionError(cause)
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
	min-height: 0;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	max-width: 42rem;
	margin: 0 auto;
	padding: 1rem 1rem 0;
	color: #475569;
}

.shop-header, .shop-tabs, .item-heading, .shop-confirmation {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.shop-header, .item-heading { justify-content: space-between; }
.shop-header h1 { font-size: 1.75rem; font-weight: 700; }
.shop-header, .shop-tabs { flex: none; }
.shop-list { flex: 1; min-height: 0; overflow-y: auto; padding: 0 0.2rem 8rem; }
.shop-item { margin: 0 0 1rem; }

.shop-item {
	border-radius: 1.5rem;
	box-shadow: 0 4px 12px #31223d0a;
	border-color: #e4d9eb;
	background: #fff;
	color: inherit;
}

.shop-expanded {
	display: grid;
	gap: 1.1rem;
	margin-top: 2rem;
	margin-bottom: 2rem;
}

.shop-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 0.3rem 0.55rem;
	margin-top: 0.65rem;
	padding-top: 0.4rem;
	border-top: 1px solid #e5e7eb;
	color: #7a7a7ab5;
	font-weight: 600;
}
.shop-owner-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; }
.shop-expanded .shop-confirmation {
	display: grid;
	gap: 1rem;
	grid-template-columns: minmax(0, 1fr);
	width: 100%;
}

.shop-expanded .button-3D.shop-button {
	width: 100%;
	min-height: 2.75rem;
	padding: 0.75rem 1rem;
	font-size: 1.15rem !important;
}
.shop-buy { --shop-top: #d6f2ef; --shop-edge: #8ccbc5; --shop-ink: #205e59; }
.shop-delete { --shop-top: #fde5eb; --shop-edge: #e9a8bc; --shop-ink: #87344d; }
.shop-title-row {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 0.75rem;
}

.shop-price, .shop-balance {
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	white-space: nowrap;
}

.shop-price {
	margin-inline-start: auto;
	padding: 0.25rem 0.55rem;
	border-radius: 0.65rem;
	background: #ece7f8;
	color: #594474;
}

.shop-balance { gap: 1rem; font-size: 24px; font-weight: 600; }
.shop-balance-number { display: inline-grid; text-align: end; font-variant-numeric: tabular-nums; }
.shop-balance-number > * { grid-area: 1 / 1; justify-self: end; }
.shop-balance-width { visibility: hidden; }
.shop-balance svg { width: 1em; height: 1em; flex: none; }

.shop-card-layout {
	display: grid;
	grid-template-columns: auto minmax(0, 1fr);
	align-items: start;
	gap: clamp(0.85rem, 4vw, 1.5rem);
}

.shop-card-content { min-width: 0; }

.shop-card-index {
	flex: none;
	display: grid;
	place-items: center;
	align-self: start;
	width: clamp(2.25rem, 8vw, 3.5rem);
	height: clamp(2.25rem, 8vw, 3.5rem);
	background: #ece7f8;
	color: #63366e;
	border-radius: 1rem;
	font-size: 1.75rem;
	line-height: 1;
	font-weight: 700;
	outline: 0.2rem solid #00000014;
	outline-offset: 0.3rem;
}

.shop-delete-modal { width: min(30rem, 92vw); max-height: 90dvh; overflow-y: auto; border-radius: 2rem; }
.shop-delete-card {
	border-radius: 2rem;
	background: linear-gradient(180deg, #f9f9fb 5%, #f3edf9 60%, #eadcf6);
}
#shop-delete-title { color: #656565; text-align: center; font-weight: 700; }
.shop-delete-body {
	display: grid;
	gap: 1.5rem;
	justify-items: center;
	color: #504758;
	text-align: center;
	overflow-wrap: anywhere;
}

.shop-delete-copy {
	display: grid;
	gap: 1.5rem;
	color: #656565;
	font-size: 1.6rem;
	font-weight: 600;
	line-height: 1.5;
}

.shop-delete-body .button-3D { margin-top: 0.5rem; }

.shop-description {
	white-space: pre-wrap;
	overflow-wrap: anywhere;
	padding: 1rem 1.5rem;
	border-radius: 1rem;
	background: #0000000a;
	margin-bottom: 2rem;
	font-size: 1.3rem;
	font-weight: 600;
	color: #555555;
}
/* The grid and divider share the same available width. */
.shop-header {
	border-bottom: 1px solid #dedee3;
	padding-bottom: 1rem;
}

.shop-tabs {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 0.5rem;
	margin: 1.4rem 0 3rem;
}

.shop-tabs .shop-button { width: 100%; min-width: 0; }
.shop-item-focused { border-color: #a182bf; outline: 1px solid #a182bf; }
.shop-item-details { display: grid; width: 100%; gap: 0.55rem; text-align: left; }
.shop-item-title { display: block; min-width: 0; font-size: 1.4rem; overflow-wrap: anywhere; }

@media (max-width: 600px) {
	.shop-delete-modal { width: 70vw; }
}

@media (max-width: 34rem) {
	.shop-tabs .shop-button { flex-direction: column; gap: 0.25rem; padding-inline: 0.2rem; }
}
</style>

<style scoped src="~/assets/css/shop-buttons.css"></style>
