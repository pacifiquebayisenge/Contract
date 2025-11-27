<template>
	<div class="violation-modal">
		<div class="avatar-container py-8">
			<div
				class="avatar"
				:style="{ backgroundColor: currentLightThemeColor }"
				:class="insideBadgeRing ? 'inside-ring' : 'outside-ring'"
			>
				<div class="avatar-stack">
					<!-- Back (angry) -->
					<div class="avatar-image back">
						<n-image
							width="60"
							:src="name.charAt(0) === 'S' ? '/memojis/paci/angry.png' : '/memojis/jeje/angry.png'"
						/>
					</div>

					<!-- Front (ashamed) -->
					<div class="avatar-image front">
						<n-image
							width="60"
							:src="name.charAt(0) === 'S' ? '/memojis/jeje/sad.png' : '/memojis/paci/sad.png'"
						/>
					</div>
				</div>
			</div>
		</div>

		<span>Did {{ name }} violate a <span class="special">contract rule</span> again ???</span>

		<button class="button-3D button-3D-colorfull-error" @click="test()">Shamefull !</button>
	</div>
</template>

<script setup>
import { useThemeStore } from '~/stores/theme'

const { name } = defineProps({
	name: {
		type: String,
		default: 'Name',
	},
})

const themeStore = useThemeStore()

// Computed property for dynamic theme color
const currentThemeColor = computed(() => themeStore.getCurrentThemeColor)

// Computed property for dynamic light theme color
const currentLightThemeColor = computed(() =>
	themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
		? themeStore.getCurrentLightThemeColor
		: themeStore.getCurrentExtraLightThemeColor
)

const insideBadgeRing = computed(
	() => themeStore.currentBadgeRingOption === themeStore.badgeRingOptions[0]
)
</script>

<style lang="scss" scoped>
.violation-modal {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 3rem;

	.n-card-header .n-card-header__main {
		text-align: center !important;
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

	span {
		font-size: 1.6rem;
		font-weight: 500;

		.special {
			color: v-bind(currentThemeColor);
			font-weight: 700;
		}
	}
}
</style>
