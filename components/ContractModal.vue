<template>
	<n-modal
		:show="props.show"
		:auto-focus="false"
		transform-origin="center"
		@update:show="emit('update:show', $event)"
	>
		<div class="contract-modal w-[80%]">
			<n-card class="modal-border" :bordered="false" size="huge" role="dialog">
				<template #header>
					<span
						style="font-weight: bold; display: flex; justify-content: center"
						class="font-color"
					>
						Contract
					</span>
				</template>

				<AvatarIcon mood="sad" />

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
})

const themeStore = useThemeStore()
const userStore = useUserStore()
const streakStore = useStreakStore()

const emit = defineEmits(['update:show'])

const currentThemeColor = computed(() => themeStore.themeColor)
const currentLightThemeColor = computed(() => themeStore.selectedLightThemeColor)

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
</style>
