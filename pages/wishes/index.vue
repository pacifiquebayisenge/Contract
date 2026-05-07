<template>
	<div class="wishes-page-container animate-item">
		<div class="content animate-item">
			<div class="avatar-container py-8 animate-item">
				<!-- Left mirrored avatar -->
				<div class="avatar-image mirror animate-item">
					<n-image
						style="transform: rotate(5deg) scaleX(-1)"
						width="80"
						src="/memojis/jeje/thinking.png"
						class="animate-item"
					/>
				</div>

				<!-- Right avatar -->
				<div class="avatar-image animate-item">
					<n-image
						style="transform: rotate(3deg)"
						width="81"
						src="/memojis/paci/thinking.png"
						class="animate-item"
					/>
				</div>

				<!-- Shadows (anchored to floor) -->
				<div class="avatar-shadow left animate-item"></div>
				<div class="avatar-shadow right animate-item"></div>
			</div>

			<p class="title">Please wait ...</p>
			<p class="comm">Not enough <strong class="special"> data </strong> yet</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { usePageAnimation } from '~/composables/usePageAnimation'
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()

const currentLightThemeColor = computed(() => themeStore.selectedLightThemeColor)
const currentThemeColor = computed(() => themeStore.themeColor)

const { animatePageEnter } = usePageAnimation()

onMounted(() => {
	animatePageEnter() // <-- THIS TRIGGERS THE ANIMATION
})
</script>

<style lang="scss" scoped>
.wishes-page-container {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100vh;
	padding-bottom: 25rem;

	.avatar-container {
		position: relative;
		display: flex;
		justify-content: center;
		gap: 3rem;

		/* Floor surface */
		&::before {
			content: '';
			position: absolute;
			bottom: -4rem;
			left: 50%;
			transform: translateX(-50%);
			width: 132%;
			height: 4rem;
			background: v-bind(currentLightThemeColor);
			border-radius: 50%;
			filter: blur(0.4rem);
			opacity: 0.6;
		}

		/* Floating avatars */
		.avatar-image {
			position: relative;
			z-index: 2;
			animation: float 3.5s ease-in-out infinite;

			img {
				display: block;
			}

			&.mirror img {
				transform: scaleX(-1);
			}
		}

		/* Shadows (fixed on floor, not floating) */
		.avatar-shadow {
			position: absolute;
			bottom: -2.5rem;
			width: 7rem;
			height: 1.2rem;
			background: rgba(0, 0, 0, 0.3);
			border-radius: 50%;
			filter: blur(0.4rem);
			animation: shadow 3.5s ease-in-out infinite;

			&.left {
				left: calc(50% - 9rem);
			}

			&.right {
				left: calc(50% + 2rem);
			}
		}
	}

	.title {
		text-align: center;
		margin-top: 5rem;
		font-size: 2rem;
		font-weight: 600;
	}

	.comm {
		text-align: center;
		font-weight: 500;
		margin-top: 1rem;

		.special {
			color: v-bind(currentThemeColor);
		}
	}
}

/* Floating bounce */
@keyframes float {
	0%,
	100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-1rem);
	}
}

/* Shadow breathing (inverse of float — grows when avatar comes down) */
@keyframes shadow {
	0%,
	100% {
		transform: scale(1.2);
		opacity: 0.75;
	}
	50% {
		transform: scale(0.9);
		opacity: 0.45;
	}
}
</style>
