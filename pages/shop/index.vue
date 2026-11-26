<template>
	<section class="shop">
		<header class="shop-header">
			<h1>Shop</h1>
			<span v-if="balance !== null">{{ balance.toLocaleString() }} credits</span>
			<button type="button" class="button-3D shop-button shop-plum" :disabled="!partnerId" @click="showForm = true">
				<PlusIcon aria-hidden="true" /> Add an item
			</button>
		</header>

		<n-modal
			v-model:show="showForm"
			:auto-focus="false"
			:mask-closable="!busy"
			:close-on-esc="!busy"
			transform-origin="center"
		>
			<div class="shop-modal">
				<n-card class="shop-modal-card" :bordered="false" role="dialog" aria-labelledby="shop-modal-title">
					<template #header>
						<h2 id="shop-modal-title">Add to the Shop</h2>
					</template>
					<form class="shop-form" @submit.prevent="publish">
						<div class="shop-avatar">
							<AvatarIcon mood="idea" :fullname="userStore.getFullname" />
						</div>
						<label>Type
							<select v-model="draft.kind">
								<option value="offer">I offer something</option>
								<option value="request">I ask for something</option>
							</select>
						</label>
						<p>{{ draft.kind === 'offer' ? 'Your partner spends the credits when they redeem your offer.' : 'You spend the credits when your partner accepts your request.' }}</p>
						<label>Title <input v-model.trim="draft.title" required maxlength="80" /></label>
						<label>Description <textarea v-model.trim="draft.description" required maxlength="500" rows="3" /></label>
						<label>Price in credits <input v-model.number="draft.price" type="number" required min="1" max="100000" /></label>
						<p v-if="error" role="alert">{{ error }}</p>
						<button type="submit" class="button-3D shop-button shop-plum" :disabled="busy">
							<SparklesIcon aria-hidden="true" /> {{ busy ? 'Publishing…' : 'Publish' }}
						</button>
					</form>
				</n-card>
			</div>
		</n-modal>

		<div class="shop-tabs" role="group" aria-label="Shop views">
			<button type="button" class="button-3D shop-button shop-aqua" :aria-pressed="view === 'open'" @click="view = 'open'">
				<ShoppingBagIcon aria-hidden="true" /> Available
			</button>
			<button type="button" class="button-3D shop-button shop-plum" :aria-pressed="view === 'accepted'" @click="view = 'accepted'">
				<ClockIcon aria-hidden="true" /> Still owed
			</button>
			<button type="button" class="button-3D shop-button shop-blue" :aria-pressed="view === 'completed'" @click="view = 'completed'">
				<CheckCircleIcon aria-hidden="true" /> Completed
			</button>
			<button type="button" class="button-3D shop-button shop-lilac" :disabled="loading || busy" @click="loadShop">
				<ArrowPathIcon aria-hidden="true" /> Refresh
			</button>
		</div>

		<p v-if="loading" role="status">Loading Shop…</p>
		<div v-if="error && !showForm" role="alert">
			{{ error }}
			<button v-if="loadFailed" type="button" class="button-3D shop-button shop-lilac" @click="loadShop">Try again</button>
		</div>
		<p v-if="!loading && !loadFailed && !visibleItems.length">{{ emptyMessages[view] }}</p>
		<article v-for="item in visibleItems" :key="item.id" class="shop-item">
			<div class="item-heading">
				<div>
					<small>{{ item.kind === 'offer' ? 'Offer' : 'Request' }} · {{ personName(item.creator_id) }}</small>
					<h2>{{ item.title }}</h2>
				</div>
				<strong>{{ item.price }} credits</strong>
			</div>
			<p class="shop-description">{{ item.description }}</p>
			<p v-if="item.status === 'accepted'">To be done by {{ personName(performer(item)) }}</p>
			<button type="button" class="button-3D shop-button shop-aqua" v-if="item.status === 'open' && item.partner_id === userId && confirming !== item.id" :disabled="busy" @click="confirming = item.id">
				{{ item.kind === 'offer' ? 'Redeem' : 'Accept request' }}
			</button>
			<div v-if="item.status === 'open' && item.partner_id === userId && confirming === item.id" class="shop-confirmation">
				<p>{{ item.kind === 'offer' ? 'You' : 'Your partner' }} will spend {{ item.price }} credits.</p>
				<button type="button" class="button-3D shop-button shop-lilac" :disabled="busy" @click="confirming = null">Cancel</button>
				<button type="button" class="button-3D shop-button shop-plum" :disabled="busy" @click="applyAction(item, 'accept')">Confirm</button>
			</div>
			<button type="button" class="button-3D shop-button shop-aqua" v-if="item.status === 'open' && item.creator_id === userId" :disabled="busy" @click="applyAction(item, 'withdraw')">Withdraw</button>
			<button type="button" class="button-3D shop-button shop-aqua" v-if="item.status === 'accepted' && performer(item) === userId" :disabled="busy" @click="applyAction(item, 'complete')">Mark as done</button>
		</article>
	</section>
</template>

<script setup lang="ts">
import { ArrowPathIcon, CheckCircleIcon, ClockIcon, PlusIcon, ShoppingBagIcon, SparklesIcon } from '@heroicons/vue/24/outline'
import type { Database } from '~/types/supabase.types'
import { useCreditStore } from '~/stores/credit'
import { useUserStore } from '~/stores/user'

type Item = Database['public']['Tables']['shop_items']['Row']
type ShopView = 'open' | 'accepted' | 'completed'
type Action = 'accept' | 'complete' | 'withdraw'

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const userStore = useUserStore()
const creditStore = useCreditStore()
const userId = computed(() => user.value?.sub)
const partnerId = computed(() => userStore.partnerProfile?.id)
const balance = computed(() => userStore.profile?.credit ?? null)
const items = ref<Item[]>([])
const view = ref<ShopView>('open')
const confirming = ref<string | null>(null)
const showForm = ref(false)
const loading = ref(false)
const loadFailed = ref(false)
const busy = ref(false)
const error = ref('')
const draft = reactive({ kind: 'offer' as Item['kind'], title: '', description: '', price: 100 })
const visibleItems = computed(() => items.value.filter((item) => item.status === view.value))
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

async function publish() {
	if (busy.value || !userId.value || !partnerId.value) return

	busy.value = true
	error.value = ''
	try {
		const { error: failure } = await supabase.from('shop_items').insert({
			...draft,
			creator_id: userId.value,
			partner_id: partnerId.value,
		})
		if (failure) throw failure
		showForm.value = false
		Object.assign(draft, { kind: 'offer', title: '', description: '', price: 100 })
		view.value = 'open'
		await loadShop()
	} catch (cause) {
		console.error('Could not publish item:', cause)
		error.value = 'Could not publish this item.'
	} finally {
		busy.value = false
	}
}

async function applyAction(item: Item, action: Action) {
	if (busy.value) return

	busy.value = true
	error.value = ''
	try {
		const { error: failure } = await supabase.rpc('apply_shop_action', {
			p_item_id: item.id,
			p_action: action,
		})
		if (failure) throw failure
		confirming.value = null
		if (action === 'accept') view.value = 'accepted'
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

watch(userId, loadShop, { immediate: true })
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
.shop-item h2 { font-size: 1.15rem; font-weight: 700; overflow-wrap: anywhere; }
.shop-tabs, .shop-item { margin: 1rem 0; }

.shop-item {
	display: grid;
	gap: 0.65rem;
	justify-items: start;
	background: white;
	border: 1px solid #dedee3;
	border-radius: 1rem;
	padding: 1rem;
}

.item-heading { width: 100%; }
.shop-description { white-space: pre-wrap; overflow-wrap: anywhere; max-width: 100%; }
.shop-modal {
	width: min(30rem, 92vw);
	max-height: 90dvh;
	overflow-y: auto;
	border-radius: 2rem;
}

.shop-modal-card {
	border-radius: 2rem;
	background: linear-gradient(180deg, #f9f9fb 5%, #f3edf9 60%, #eadcf6);
}

#shop-modal-title {
	color: #45404b;
	text-align: center;
	font-weight: 700;
}

.shop-avatar { display: flex; justify-content: center; }
.shop-form, .shop-form label { display: grid; gap: 0.4rem; }
.shop-form { gap: 1rem; color: #504758; }
.shop-form label { font-weight: 600; }

.shop-form input, .shop-form select, .shop-form textarea {
	width: 100%;
	border: 1px solid transparent;
	border-radius: 1rem;
	padding: 0.6rem 0.9rem;
	background: #0000000a;
	color: #423747;
}

.shop-form :is(input, select, textarea):focus-visible {
	border-color: #a182bf;
	outline: 2px solid #c9b4df;
}

.shop-plum { --shop-top: #eedcf5; --shop-edge: #c8a6d9; --shop-ink: #63366e; }
.shop-aqua { --shop-top: #d6f2ef; --shop-edge: #8ccbc5; --shop-ink: #205e59; }
.shop-blue { --shop-top: #dbe9fd; --shop-edge: #a4bce7; --shop-ink: #315181; }
.shop-lilac { --shop-top: #ede7fa; --shop-edge: #c3b4e1; --shop-ink: #514275; }

/* Keep the same raised and pressed motion as the existing action buttons. */
.button-3D.shop-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.4em;
	width: auto;
	padding: 0.5rem 0.85rem;
	background: var(--shop-top);
	border-color: var(--shop-edge);
	color: var(--shop-ink);
	box-shadow: 0 0.4rem 0 var(--shop-edge);
	font-size: clamp(0.85rem, 2.5vw, 1.05rem) !important;
}

.shop-button svg { width: 1.15em; height: 1.15em; flex: none; }
.button-3D.shop-button:hover:not(:disabled) {
	background: color-mix(in srgb, var(--shop-top) 75%, var(--shop-edge));
	box-shadow: 0 0.5rem 0 var(--shop-edge);
}
.button-3D.shop-button:is(:active, [aria-pressed='true']) {
	transform: translateY(0);
	box-shadow: none;
	background: color-mix(in srgb, var(--shop-top) 75%, var(--shop-edge));
}
.shop-button:focus-visible { outline: 2px solid var(--shop-ink); outline-offset: 3px; }
.shop-button:disabled { opacity: 0.6; cursor: default; }
.shop-form .shop-button { width: 100%; }

@media (prefers-reduced-motion: reduce) {
	.shop-button { transition: none; }
}
</style>
