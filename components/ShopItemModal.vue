<template>
	<n-modal
		:show="show"
		@update:show="emit('update:show', $event)"
		:auto-focus="false"
		:mask-closable="!busy"
		:close-on-esc="!busy"
		transform-origin="center"
	>
		<div class="shop-modal">
			<n-card class="shop-modal-card" :bordered="false" role="dialog" aria-labelledby="shop-modal-title">
				<template #header>
					<h2 id="shop-modal-title">New item</h2>
				</template>
				<form class="shop-form" @submit.prevent="publish">
					<div class="shop-avatar">
						<AvatarIcon mood="idea" :fullname="userStore.getFullname" />
					</div>
					<fieldset class="shop-performer">
						<legend>Who will do it?</legend>
						<label><input v-model="draft.kind" type="radio" value="offer" /> I will</label>
						<label><input v-model="draft.kind" type="radio" value="request" /> My partner will</label>
					</fieldset>
					<p>{{ draft.kind === 'offer' ? 'Your partner spends the credits when they redeem your offer.' : 'You spend the credits when your partner accepts your request.' }}</p>
					<label>Title <input v-model.trim="draft.title" required maxlength="80" /></label>
					<label>Description <textarea v-model.trim="draft.description" required maxlength="500" rows="3" /></label>
					<label>Price in credits <input v-model.number="draft.price" type="number" required min="1" max="100000" /></label>
					<p v-if="error" role="alert">{{ error }}</p>
					<button type="submit" class="button-3D shop-button shop-new" :disabled="busy">
						<SparklesIcon aria-hidden="true" /> {{ busy ? 'Publishing…' : 'Publish' }}
					</button>
				</form>
			</n-card>
		</div>
	</n-modal>
</template>

<script setup lang="ts">
import { SparklesIcon } from '@heroicons/vue/24/outline'
import type { Database } from '~/types/supabase.types'
import { useUserStore } from '~/stores/user'

defineProps<{ show: boolean }>()
const emit = defineEmits<{ 'update:show': [show: boolean] }>()
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const userStore = useUserStore()
const userId = computed(() => user.value?.sub)
const busy = ref(false)
const error = ref('')
const draft = reactive({
	kind: 'offer' as Database['public']['Tables']['shop_items']['Row']['kind'],
	title: '',
	description: '',
	price: 100,
})
const shopRevision = useState('shop-revision', () => 0)

async function publish() {
	if (busy.value || !userId.value || !userStore.partnerProfile) return

	busy.value = true
	error.value = ''
	try {
		const { error: failure } = await supabase.from('shop_items').insert({
			...draft,
			creator_id: userId.value,
			partner_id: userStore.partnerProfile.id,
		})
		if (failure) throw failure
		emit('update:show', false)
		Object.assign(draft, { kind: 'offer', title: '', description: '', price: 100 })
		shopRevision.value++
	} catch (cause) {
		console.error('Could not publish item:', cause)
		error.value = 'Could not publish this item.'
	} finally {
		busy.value = false
	}
}

</script>

<style scoped>
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

.shop-form .shop-button { width: 100%; }

.shop-performer {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.shop-performer legend {
	margin-bottom: 0.4rem;
	font-weight: 600;
}

.shop-performer label {
	display: flex;
	align-items: center;
	flex: 1 1 auto;
	padding: 0.5rem;
	border-radius: 0.75rem;
	background: #0000000a;
}

.shop-performer input {
	width: auto;
	accent-color: #63366e;
}

@media (max-width: 600px) {
	.shop-modal { width: 70vw; }
}
</style>

<style scoped src="~/assets/css/shop-buttons.css"></style>
