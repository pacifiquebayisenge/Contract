<template>
	<n-modal
		:show="props.show"
		:auto-focus="false"
		:mask-closable="!saving"
		:close-on-esc="!saving"
		transform-origin="center"
		@update:show="emit('update:show', $event)"
	>
		<div class="violation-modal w-[80%]">
			<n-card
				class="modal-border gradient-background"
				:style="{
					'--theme-color': currentLightThemeColor,
				}"
				:bordered="false"
				size="huge"
				role="dialog"
			>
				<template #header>
					<span
						style="font-weight: bold; display: flex; justify-content: center"
						class="font-color"
					>
						Violation
					</span>
				</template>

				<AvatarIcon mood="tear-drop" :fullname="props.fullname" />

				<span class="font-color text-center" :style="{ '--theme-color': currentThemeColor }">
					Did
					<span class="special">{{ pseudo }}</span>
					violate a
					<span class="special">contract rule</span>
					again ???
				</span>

				<div class="rule-field">
					<label for="violation-rule">Which rule?</label>
					<select id="violation-rule" v-model="selectedRuleId" :disabled="saving || !rules.length">
						<option disabled value="">
							{{ rules.length ? 'Choose a contract rule' : 'No contract rules available' }}
						</option>
						<option v-for="rule in rules" :key="rule.id" :value="rule.id">
							{{ rule.title }}
						</option>
					</select>
				</div>

				<p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>

				<button
					type="button"
					class="button-3D button-3D-colorful-error"
					:disabled="!selectedRuleId || !partner || saving"
					@click="updatePartnerViolation"
				>
					{{ saving ? 'Saving…' : 'Shameful !' }}
				</button>
			</n-card>
		</div>
	</n-modal>
</template>

<script setup>
import { useWebHaptics } from 'web-haptics/vue'
import { useContractStore } from '~/stores/contract'
import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'
import { useViolationStore } from '~/stores/violation'

const props = defineProps({
	show: {
		type: Boolean,
		required: true,
	},
	pseudo: {
		type: String,
		default: 'pseudo',
	},
	fullname: {
		type: String,
		default: '',
	},
})

const themeStore = useThemeStore()
const userStore = useUserStore()
const violationStore = useViolationStore()
const contractStore = useContractStore()
const rules = computed(() => contractStore.contractList)
const selectedRuleId = ref('')
const saving = ref(false)
const errorMessage = ref('')

const { trigger } = useWebHaptics()

const emit = defineEmits(['update:show'])

const currentThemeColor = computed(() => themeStore.themeColor)
const currentLightThemeColor = computed(() => themeStore.lightThemeColor)

const partner = computed(() => userStore.partnerProfile)

watch(
	() => props.show,
	(isOpen) => {
		if (!isOpen) return
		selectedRuleId.value = ''
		errorMessage.value = ''
	}
)

const updatePartnerViolation = async () => {
	if (!partner.value || !selectedRuleId.value || saving.value) return

	saving.value = true
	errorMessage.value = ''
	trigger([{ duration: 400 }], { intensity: 1 })

	try {
		await violationStore.updatePartnerViolation(selectedRuleId.value)
		emit('update:show', false)
	} catch (error) {
		console.error('Failed to save violation:', error)
		errorMessage.value = 'Could not save the violation. Please try again.'
	} finally {
		saving.value = false
	}
}
</script>

<style lang="scss" scoped>
.violation-modal {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 3rem;
	border-radius: 2rem;
}

:deep(.n-card-content) {
	display: flex;
	flex-direction: column;
	gap: 4rem;
	align-items: center;
	align-content: center;
	justify-content: center;
}

:deep(.modal-border) {
	border-radius: 2rem !important;
}

:deep(.font-color) {
	font-size: 1.6rem;
	font-weight: 500;
}

:deep(.special) {
	color: var(--theme-color);
	font-weight: 700;
}

.rule-field {
	display: grid;
	gap: 0.5rem;
	width: 100%;

	select {
		width: 100%;
		padding: 0.7rem 1rem;
		border: 1px solid #b9baba;
		border-radius: 0.8rem;
		background: #fff;
		color: #333;
	}
}

.error-message {
	color: #9c2525;
}

button:disabled {
	opacity: 0.55;
	cursor: default;
}

.gradient-background {
	background: linear-gradient(
		to bottom,
		#f9f9fb 0%,
		#f9f9fb 5%,
		color-mix(in srgb, var(--theme-color) 15%, #f9f9fb) 60%,
		color-mix(in srgb, var(--theme-color) 30%, #f9f9fb) 100%
	);

	background-attachment: fixed;
}

.gradient::before {
	content: '';
	position: fixed;
	inset: 0;
	pointer-events: none;
	z-index: 0;

	background: linear-gradient(
		135deg,
		transparent 0%,
		transparent 50%,
		color-mix(in srgb, var(--theme-color) 3%, transparent) 100%
	);

	opacity: 0.25;
}
</style>
