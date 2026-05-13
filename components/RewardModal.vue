<template>
	<n-modal
		:show="props.show"
		:auto-focus="false"
		transform-origin="center"
		@update:show="emit('update:show', $event)"
	>
		<div class="reward-modal w-[80%]">
			<n-card
				class="modal-border gradient-background"
				:style="{
					'--theme-color': currentThemeColor,
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
						Reward
					</span>
				</template>

				<AvatarIcon mood="lucky" :fullname="props.fullname" />

				<span class="font-color text-center" :style="{ '--theme-color': currentThemeColor }">
					Did
					<span class="special">{{ pseudo }}</span>
					earned a
					<span class="special">reward</span>
					???
				</span>

				<div class="field" :style="{ '--line-fill-color': currentLightThemeColor }">
					<input
						v-model="reward"
						type="text"
						placeholder="Amount of reward"
						class="bg-[#0000000a] rounded-[1rem] font-color contract-input"
					/>

					<div class="line">
						<div class="line-fill" />
					</div>
				</div>

				<div
					class="field w-[100%] max-w-[85rem]"
					:style="{ '--line-fill-color': currentLightThemeColor }"
				>
					<textarea
						v-model="description"
						:placeholder="`Description of why ${userStore.partnerProfile.firstname} earned a reward ...`"
						class="h-[15rem] bg-[#0000000a] rounded-[1rem] w-[100%] max-w-[85rem] font-color contract-textarea"
					/>

					<div class="line">
						<div class="line-fill" />
					</div>
				</div>

				<button class="button-3D button-3D-colorful-success" @click="partnerReward()">
					Amazing !
				</button>
			</n-card>
		</div>
	</n-modal>
</template>

<script lang="ts" setup>
import { watch } from 'vue'
import { useCreditStore } from '~/stores/credit'
import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'
import { nearestHundred } from '../utils/numbers'

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
const creditStore = useCreditStore()

const emit = defineEmits(['update:show'])

const description = ref('')
const reward = ref()

const currentThemeColor = computed(() => themeStore.themeColor)
const currentLightThemeColor = computed(() => themeStore.selectedLightThemeColor)

const partner = computed(() => userStore.partnerProfile)

watch(
	() => props.show,
	(isOpen) => {
		if (isOpen) {
			reward.value = ''
			description.value = ''
		}
	}
)

const partnerReward = async () => {
	if (!description.value || !reward.value) return

	if (!partner.value) {
		console.warn('Partner profile not loaded yet')
		return
	}

	await creditStore.increasePartnerCredit(nearestHundred(reward.value), description.value)

	emit('update:show', false)
}
</script>

<style lang="scss" scoped>
.reward-modal {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 3rem;
}

:deep(.n-card-content) {
	display: flex;
	flex-direction: column;
	gap: 3rem;
	align-items: center;
	align-content: center;
	justify-content: center;
}

:deep(.modal-border) {
	border-radius: 2rem;
}

:deep(.font-color) {
	font-size: 1.6rem;
	font-weight: 500;
}

:deep(.special) {
	color: var(--theme-color);
	font-weight: 700;
}

:deep(input),
:deep(textarea) {
	padding: 0.5rem 1.5rem;
	border-radius: 1rem;
	border: none;
	outline: none;
	font-size: 1.5rem;
	font-weight: 600;
	color: #555555;
	transition: padding 0.3s 0.2s ease;
	resize: none;
}

:deep(.field) {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
}

:deep(.line) {
	width: 100%;

	height: 3px;
	margin-top: 0.5rem;
	border-radius: 1rem;
	overflow: hidden;
}

:deep(.line-fill) {
	width: 100%;
	height: 100%;
	transform: scaleX(0);
	transform-origin: left;
	transition: transform 0.5s ease;
	background-color: var(--line-fill-color);
}

:deep(.field:focus-within .line-fill) {
	transform: scaleX(1);
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
