<template>
	<div class="empty-state-container animate-item">
		<div class="content animate-item">
			<div class="avatar-container py-8 animate-item">
				<div class="avatar-image mirror animate-item">
					<n-image :style="leftImageStyle" :width="leftAvatarWidth" :src="leftAvatar" />
				</div>

				<div class="avatar-image animate-item">
					<n-image :style="rightImageStyle" :width="rightAvatarWidth" :src="rightAvatar" />
				</div>

				<div class="avatar-shadow left animate-item"></div>
				<div class="avatar-shadow right animate-item"></div>
			</div>

			<p class="title">{{ title }}</p>

			<p v-if="message" class="comm mb-5" v-html="message"></p>
			<p v-if="subMessage" class="comm" v-html="subMessage"></p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { usePageAnimation } from '~/composables/usePageAnimation'
import { useThemeStore } from '~/stores/theme'

const props = withDefaults(
	defineProps<{
		title?: string
		message?: string
		subMessage?: string
		leftAvatar?: string
		rightAvatar?: string
		leftAvatarWidth?: number
		rightAvatarWidth?: number
		animateOnMount?: boolean
	}>(),
	{
		title: 'Please wait ...',
		message: 'You were <strong class="special">excited</strong> huh 👀😂',
		subMessage: 'Not enough <strong class="special">data</strong> yet',
		leftAvatar: '/memojis/jeje/thinking.png',
		rightAvatar: '/memojis/paci/thinking.png',
		leftAvatarWidth: 80,
		rightAvatarWidth: 81,
		animateOnMount: true,
	}
)

const themeStore = useThemeStore()

const currentLightThemeColor = computed(() => themeStore.selectedLightThemeColor)
const currentThemeColor = computed(() => themeStore.themeColor)

const leftImageStyle = computed(() => ({
	transform: 'rotate(5deg) scaleX(-1)',
}))

const rightImageStyle = computed(() => ({
	transform: 'rotate(3deg)',
}))

const { animatePageEnter } = usePageAnimation()

onMounted(() => {
	if (props.animateOnMount) {
		animatePageEnter()
	}
})
</script>

<style lang="scss" scoped>
.empty-state-container {
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

		.avatar-image {
			position: relative;
			z-index: 2;
			animation: float 3.5s ease-in-out infinite;
		}

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

		:deep(.special) {
			color: v-bind(currentThemeColor);
		}
	}
}

@keyframes float {
	0%,
	100% {
		transform: translateY(0);
	}

	50% {
		transform: translateY(-1rem);
	}
}

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
