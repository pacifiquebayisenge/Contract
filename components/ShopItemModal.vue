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
		Object.assign(draft, { title: '', description: '', price: 100 })
		shopRevision.value++
	} catch (cause) {
		console.error('Could not publish item:', cause)
		const code = typeof cause === 'object' && cause !== null && 'code' in cause ? cause.code : null
		const message = typeof cause === 'object' && cause !== null && 'message' in cause ? cause.message : null
		if (code === 'PGRST205' || code === '42P01' ||
			(code === '23502' && typeof message === 'string' && message.includes('"kind"'))) {
			error.value = 'The Shop database needs the latest migrations.'
		} else {
			error.value = 'Could not publish this item.'
		}
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

.shop-form input, .shop-form textarea {
	width: 100%;
	border: 1px solid transparent;
	border-radius: 1rem;
	padding: 0.6rem 0.9rem;
	background: #0000000a;
	color: #423747;
}

.shop-form :is(input, textarea):focus-visible {
	border-color: #a182bf;
	outline: 2px solid #c9b4df;
}

.shop-form .shop-button {
	width: 100%;
	margin-top: 0.75rem;
}

@media (max-width: 600px) {
	.shop-modal { width: 70vw; }
}
</style>

<style scoped src="~/assets/css/shop-buttons.css"></style>
