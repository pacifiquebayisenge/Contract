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
				<span v-if="tasksForYou" class="shop-owed-count" :aria-label="`${tasksForYou} tasks for you`">{{ tasksForYou }}</span>
			</button>
			<button type="button" class="button-3D shop-button shop-blue" :aria-pressed="view === 'completed'" @click="view = 'completed'">
				<CheckCircleIcon aria-hidden="true" /> Completed
			</button>
			<button type="button" class="button-3D shop-button shop-refresh" :disabled="loading || busy" @click="loadShop">
				<ArrowPathIcon aria-hidden="true" /> Refresh
			</button>
		</div>

		<div ref="shopList" class="shop-list">
			<p v-if="loading" role="status">Loading Shop…</p>
			<div v-if="error && !deletingItem" role="alert">
				{{ error }}
				<button v-if="loadFailed" type="button" class="button-3D shop-button shop-refresh" @click="loadShop">Try again</button>
			</div>
			<p v-if="!loading && !loadFailed && !visibleItems.length">{{ emptyMessages[view] }}</p>
			<n-card v-for="({ item, count, purchases }, index) in visibleItems" :key="item.id" class="shop-item app-surface-card animate-item" :bordered="true" :class="{ 'shop-item-focused': item.id === focusedItemId }">
				<span v-if="count > 1" class="shop-item-count" :aria-label="`${count} purchases`">{{ count }}</span>
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
									:disabled="busy || !!purchaseTimer(item.id, item.creator_id)"
									@click="applyAction(item, 'buy_own')"
								>
									<template v-if="purchaseTimer(item.id, item.creator_id)"><ClockIcon aria-hidden="true" /> {{ purchaseTimer(item.id, item.creator_id) }}</template><template v-else>Buy</template>
								</button>
								<div v-if="item.status === 'accepted'" class="shop-schedule">
									<div v-for="(purchase, taskIndex) in purchases" :key="purchase.id" class="shop-scheduled-task">
										<p v-if="count > 1"><strong>Task {{ taskIndex + 1 }}</strong></p>
										<p>To be done by {{ personName(performer(purchase)) }}</p>
										<label>
											<span>Planned date (optional)</span>
											<input
												type="date"
												:value="purchase.scheduled_on ?? ''"
												:disabled="busy"
												@change="setPurchaseDate(purchase, $event)"
											/>
										</label>
										<button v-if="purchase.scheduled_on" type="button" class="shop-clear-date" :disabled="busy" @click="savePurchaseDate(purchase, null)">
											Clear date
										</button>
										<button v-if="performer(purchase) === userId" type="button" class="button-3D shop-button shop-aqua" :disabled="busy" @click="applyAction(purchase, 'complete')">
											Mark as done
										</button>
									</div>
								</div>
								<div v-if="item.status === 'open' && item.partner_id === userId && confirming === item.id" class="shop-confirmation">
									<p v-if="item.kind === 'undecided'">Choose who will do it. The other person pays {{ item.price }} credits.</p>
									<p v-else>{{ item.kind === 'offer' ? 'You' : 'Your partner' }} will spend {{ item.price }} credits.</p>
									<button type="button" class="button-3D shop-button shop-refresh" :disabled="busy" @click="confirming = null">Cancel</button>
									<button type="button" class="button-3D shop-button shop-buy" :disabled="busy || !!purchaseTimer(item.id, item.kind === 'request' ? item.creator_id : item.partner_id)" @click="applyAction(item, 'accept')">
										<template v-if="purchaseTimer(item.id, item.kind === 'request' ? item.creator_id : item.partner_id)"><ClockIcon aria-hidden="true" /> {{ purchaseTimer(item.id, item.kind === 'request' ? item.creator_id : item.partner_id) }}</template><template v-else>{{ item.kind === 'request' ? 'Accept request' : 'Buy' }}</template>
									</button>
									<button v-if="item.kind === 'undecided'" type="button" class="button-3D shop-button shop-aqua" :disabled="busy" @click="applyAction(item, 'propose')">I can do it</button>
								</div>
								<div v-if="item.status === 'proposed'" class="shop-confirmation">
									<p>{{ item.creator_id === userId ? `Your partner offered to do it. Accept for ${item.price} credits?` : 'Waiting for your partner to confirm.' }}</p>
									<button v-if="item.creator_id === userId" type="button" class="button-3D shop-button shop-owed" :disabled="busy || !!purchaseTimer(item.id, item.creator_id)" @click="applyAction(item, 'approve')"><template v-if="purchaseTimer(item.id, item.creator_id)"><ClockIcon aria-hidden="true" /> {{ purchaseTimer(item.id, item.creator_id) }}</template><template v-else>Accept and pay</template></button>
									<button type="button" class="button-3D shop-button shop-refresh" :disabled="busy" @click="applyAction(item, 'decline')">{{ item.creator_id === userId ? 'Decline' : 'Cancel proposal' }}</button>
								</div>

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
import { usePageAnimation } from '~/composables/usePageAnimation'
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
const now = ref(Date.now())
let clock: ReturnType<typeof setInterval> | undefined

onMounted(() => {
	now.value = Date.now()
	clock = setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => clearInterval(clock))

const purchaseDeadlines = computed(() => {
	const deadlines = new Map<string, number>()
	for (const purchase of items.value) {
		if (!purchase.source_item_id || !purchase.accepted_at) continue
		const payer = purchase.kind === 'offer' ? purchase.partner_id : purchase.creator_id
		const key = `${purchase.source_item_id}:${payer}`
		const deadline = Date.parse(purchase.accepted_at) + 24 * 60 * 60 * 1000
		deadlines.set(key, Math.max(deadlines.get(key) ?? 0, deadline))
	}
	return deadlines
})

function purchaseTimer(itemId: string, payer: string) {
	const deadline = purchaseDeadlines.value.get(`${itemId}:${payer}`) ?? 0
	const seconds = Math.ceil((deadline - now.value) / 1000)
	if (seconds <= 0) return ''

	return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
		.map((part) => String(part).padStart(2, '0')).join(':')
}
const error = ref('')
const tasksForYou = computed(() =>
	items.value.filter((item) => item.status === 'accepted' && performer(item) === userId.value).length,
)

const visibleItems = computed(() => {
	const visible = items.value.filter((item) =>
		item.status === view.value || (view.value === 'open' && item.status === 'proposed'),
	)
	const groups = new Map<string, { item: Item; count: number; purchases: Item[] }>()
	for (const item of visible) {
		const key = view.value === 'open' ? item.id : item.source_item_id ?? item.id
		const group = groups.get(key)
		if (!group) {
			groups.set(key, { item, count: 1, purchases: [item] })
			continue
		}

		group.count++
		group.purchases.push(item)
		// Open the purchase referenced by a notification, or show one of your own tasks first.
		if (item.id === focusedItemId.value ||
			(group.item.id !== focusedItemId.value && performer(item) === userId.value && performer(group.item) !== userId.value)) {
			group.item = item
		}
	}

	const cards = [...groups.values()]
	const focused = cards.find(({ item }) => item.id === focusedItemId.value)
	return focused ? [focused, ...cards.filter((card) => card !== focused)] : cards
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
		return 'The Shop action is missing from Supabase. Apply the latest Shop migrations.'
	}
	if (code === '42703' || code === 'PGRST204' || message === 'This shop action is unavailable') {
		return 'This action is unavailable. Refresh the Shop. If Buy still fails on your own item, verify the Shop purchases migration.'
	}
	if (message === 'This item can only be purchased once every 24 hours') {
		return 'You can buy this item again 24 hours after the previous purchase.'
	}
	if (message === 'Not enough credits') return 'Not enough credits to buy this item.'
	if (message === 'The Shop item changed. Refresh before trying again.') return message
	if (code === '42501') return 'The database denied this Shop action. Check your session and Shop permissions.'
	return 'Could not update this item. See the browser console for the database error.'
}

async function setPurchaseDate(item: Item, event: Event) {
	const input = event.target as HTMLInputElement
	if (!(await savePurchaseDate(item, input.value || null))) {
		input.value = item.scheduled_on ?? ''
	}
}

async function savePurchaseDate(item: Item, date: string | null) {
	if (busy.value) return false

	busy.value = true
	error.value = ''
	try {
		const { error: failure } = await supabase.rpc('schedule_shop_purchase', {
			p_item_id: item.id,
			p_scheduled_on: date,
		})
		if (failure) throw failure

		item.scheduled_on = date
		return true
	} catch (cause) {
		console.error('Could not set Shop purchase date:', cause)
		error.value = 'Could not save the planned date. Refresh the Shop and try again.'
		return false
	} finally {
		busy.value = false
	}
}

async function applyAction(item: Item, action: Action) {
	if (busy.value) return

	busy.value = true
	error.value = ''
	try {
		const buying = action === 'accept' || action === 'approve' || action === 'buy_own'
		const args = { p_item_id: item.id, p_action: action, p_expected_price: item.price }
		const result = buying
			? await supabase.rpc('purchase_shop_item_at_price', args)
			: await supabase.rpc('apply_shop_action_at_price', args)
		if (result.error) throw result.error

		if (action === 'withdraw') deletingItem.value = null
		if (action === 'propose' || buying) {
			// A notification failure must not undo or resubmit the saved proposal.
			void $fetch('/api/send-notification', {
				method: 'POST',
				body: action === 'propose'
					? { shopProposalId: item.id }
					: { shopItemId: result.data, shopAction: 'purchased' },
			}).catch((error) => console.error('Could not send Shop push:', error))
		}
		confirming.value = null
		if (buying) view.value = 'accepted'
		await loadShop()
	} catch (cause) {
		if (typeof cause === 'object' && cause !== null && 'message' in cause &&
			cause.message === 'This item can only be purchased once every 24 hours') {
			// A purchase from another device may have started the cooldown.
			await loadShop()
			return
		}
		console.error('Could not update Shop item:', cause)
		error.value = shopActionError(cause)
	} finally {
		busy.value = false
	}
}

const shopList = ref<HTMLElement | null>(null)
const { animatePageEnter } = usePageAnimation()
let animatedShopItems = false

onMounted(() => {
	watch(visibleItems, (cards) => {
		if (animatedShopItems || !cards.length || !shopList.value) return

		// The Shop loads its cards asynchronously, so wait until they are rendered.
		animatedShopItems = true
		if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			animatePageEnter(shopList.value)
		}
	}, { immediate: true, flush: 'post' })
})

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
	position: relative;
	border-radius: 1.5rem;
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
.shop-item-count, .shop-owed-count {
	position: absolute;
	top: 0.2rem;
	right: 0.35rem;
	padding: 0.1rem 0.35rem;
	border-radius: 0.45rem;
	font-size: 0.75rem;
	font-weight: 700;
	line-height: 1.2;
}

.shop-item-count {
	background: #ece7f8;
	color: #63366e;
}

.shop-owed-count {
	background: #704b14;
	color: #fff;
}

.shop-schedule, .shop-scheduled-task, .shop-scheduled-task label {
	display: grid;
	gap: 0.75rem;
	min-width: 0;
}

.shop-scheduled-task {
	padding: 0.9rem;
	border: 1px solid #e4d9eb;
	border-radius: 0.85rem;
	background: #f9f6fc;
}

.shop-scheduled-task label { gap: 0.3rem; font-weight: 600; }
.shop-scheduled-task input {
	display: block;
	width: 100%;
	min-width: 0;
	padding: 0.45rem 0.65rem;
	border: 1px solid #d8c9e1;
	border-radius: 0.5rem;
	background: #fff;
	color: inherit;
}
.shop-clear-date { justify-self: start; text-decoration: underline; }

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
