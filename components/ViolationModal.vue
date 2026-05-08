<template>
	<n-modal
		:show="props.show"
		:auto-focus="false"
		transform-origin="center"
		@update:show="emit('update:show', $event)"
	>
		<div class="violation-modal w-[80%]">
			<n-card class="modal-border" :bordered="false" size="huge" role="dialog">
				<template #header>
					<span
						style="font-weight: bold; display: flex; justify-content: center"
						class="font-color"
					>
						Violation
					</span>
				</template>

				<AvatarIcon mood="tear-drop" />

				<span class="font-color text-center" :style="{ '--theme-color': currentThemeColor }">
					Did
					<span class="special">{{ pseudo }}</span>
					violate a
					<span class="special">contract rule</span>
					again ???
				</span>

				<button class="button-3D button-3D-colorful-error" @click="updatePartnerViolation()">
					Shameful !
				</button>
			</n-card>
		</div>
	</n-modal>
</template>

<script setup>
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
})

const themeStore = useThemeStore()
const userStore = useUserStore()
const violationStore = useViolationStore()

const emit = defineEmits(['update:show'])

const currentThemeColor = computed(() => themeStore.themeColor)
const currentLightThemeColor = computed(() => themeStore.selectedLightThemeColor)

const partner = computed(() => userStore.partnerProfile)

const updatePartnerViolation = async () => {
	if (!partner.value) {
		console.warn('Partner profile not loaded yet')
		return
	}

	await violationStore.updatePartnerViolation()

	emit('update:show', false)
}
</script>

<style lang="scss" scoped>
.violation-modal {
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

.avatar-container {
	display: flex;
	justify-content: center;
	gap: 3rem;

	.avatar {
		width: 8rem;
		height: 8rem;
		background-color: v-bind(currentLightThemeColor);
		border-radius: 2rem;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		overflow: visible;

		&.outside-ring {
			outline: 2px solid rgba(0, 0, 0, 0.1);
			outline-offset: 3px;
		}
		&.inside-ring {
			outline: 2px solid rgba(0, 0, 0, 0.1);
			outline-offset: -5px;
		}

		.avatar-stack {
			position: relative;
			width: 100%;
			height: 100%;
		}

		.avatar-image {
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			transition:
				transform 0.3s ease,
				opacity 0.3s ease;
		}

		/* Back: angry one */
		.avatar-image.back {
			z-index: 1;
			transform: translate(-23%, -55%) rotate(10deg);
			opacity: 0.85;
		}

		/* Front: ashamed one */
		.avatar-image.front {
			z-index: 2;
			transform: translate(-71%, -25%) rotate(5deg) scale(0.9);
			opacity: 1;
		}

		/* Optional hover: slight interaction */
		&:hover .avatar-image.back {
			transform: translate(-35%, -75%) rotate(14deg) scale(1.05);
		}
		&:hover .avatar-image.front {
			transform: translate(-60%, -20%) rotate(8deg) scale(0.88);
		}
	}
}
</style>
