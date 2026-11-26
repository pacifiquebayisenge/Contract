<template>
	<section class="shop">
		<header class="shop-header">
			<h1>Shop</h1>
			<span v-if="balance !== null">{{ balance.toLocaleString() }} credits</span>
			<button type="button" class="button-3D button-3D-colorful" :disabled="!partnerId" @click="showForm = true">
				Add an item
			</button>
		</header>

		<n-modal v-model:show="showForm" preset="card" title="Add to the Shop" class="shop-modal" :mask-closable="!busy" :close-on-esc="!busy" :closable="!busy">
			<form class="shop-form" @submit.prevent="publish">
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
				<button class="button-3D button-3D-colorful" :disabled="busy">Publish</button>
			</form>
		</n-modal>

		<div class="shop-tabs" aria-label="Shop views">
			<n-button :type="view === 'open' ? 'primary' : 'default'" @click="view = 'open'">Available</n-button>
			<n-button :type="view === 'accepted' ? 'primary' : 'default'" @click="view = 'accepted'">Still owed</n-button>
			<n-button :type="view === 'completed' ? 'primary' : 'default'" @click="view = 'completed'">Completed</n-button>
			<n-button text :disabled="loading || busy" @click="loadShop">Refresh</n-button>
		</div>

		<p v-if="loading" role="status">Loading Shop…</p>
		<div v-if="error && !showForm" role="alert">
			{{ error }}
			<n-button v-if="loadFailed" text @click="loadShop">Try again</n-button>
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
			<n-button v-if="item.status === 'open' && item.partner_id === userId && confirming !== item.id" :disabled="busy" @click="confirming = item.id">
				{{ item.kind === 'offer' ? 'Redeem' : 'Accept request' }}
			</n-button>
			<div v-if="item.status === 'open' && item.partner_id === userId && confirming === item.id" class="shop-confirmation">
				<p>{{ item.kind === 'offer' ? 'You' : 'Your partner' }} will spend {{ item.price }} credits.</p>
				<n-button :disabled="busy" @click="confirming = null">Cancel</n-button>
				<n-button type="primary" :disabled="busy" @click="applyAction(item, 'accept')">Confirm</n-button>
			</div>
			<n-button v-if="item.status === 'open' && item.creator_id === userId" text :disabled="busy" @click="applyAction(item, 'withdraw')">Withdraw</n-button>
			<n-button v-if="item.status === 'accepted' && performer(item) === userId" :disabled="busy" @click="applyAction(item, 'complete')">Mark as done</n-button>
		</article>
	</section>
</template>

<script setup lang="ts">
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
.shop-form, .shop-form label { display: grid; gap: 0.5rem; }
.shop-form { gap: 1rem; }

.shop-form input, .shop-form select, .shop-form textarea {
	width: 100%;
	border: 1px solid #bbb;
	border-radius: 0.5rem;
	padding: 0.5rem;
}
</style>

<style>
.shop-modal { width: min(30rem, 92vw); }
</style>
