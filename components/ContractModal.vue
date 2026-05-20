<template>
	<n-modal
		:show="props.show"
		:auto-focus="false"
		transform-origin="center"
		@update:show="emit('update:show', $event)"
	>
		<div class="contract-modal w-[80%]">
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
						Contract
					</span>
				</template>

				<AvatarIcon mood="sad" :fullname="props.fullname" />

				<span class="font-color text-center" :style="{ '--theme-color': currentThemeColor }">
					Did
					<span class="special">{{ pseudo }}</span>
					use
					<span class="special">contract </span>
					again???
				</span>

				<button class="button-3D button-3D-colorful-warning" @click="updatePartnerStreak()">
					Unbelievable !
				</button>
			</n-card>
		</div>
	</n-modal>
</template>

<script lang="ts" setup>
import { useWebHaptics } from 'web-haptics/vue'
import { useStreakStore } from '~/stores/streak'
import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'

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
const streakStore = useStreakStore()

const { trigger } = useWebHaptics()

const emit = defineEmits(['update:show'])

const currentThemeColor = computed(() => themeStore.themeColor)
const currentLightThemeColor = computed(() => themeStore.lightThemeColor)

const updatePartnerStreak = async () => {
	const partner = userStore.partnerProfile

	if (!partner) {
		console.warn('Partner profile not loaded yet')
		return
	}

	// if ((partner.streak ?? 0) < 3) {
	// } else {
	// 	console.log("BLOCKED: streak >= 3");
	// }

	trigger([{ duration: 30 }, { delay: 60, duration: 40, intensity: 1 }])

	emit('update:show', false)

	await streakStore.updatePartnerStreak()
}
</script>

<style lang="scss" scoped>
.contract-modal {
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
