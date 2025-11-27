<!-- components/PWAUpdateDialog.vue -->
<template>
	<n-modal
		v-model:show="showDialog"
		:mask-closable="false"
		:closable="false"
		style="width: 380px; border-radius: 2rem !important"
		preset="card"
		:bordered="true"
		class="update-dialog-container"
	>
		<div class="update-dialog">
			<div class="dialog-content">
				<n-text class="dialog-title">New Version Available</n-text>
				<n-text depth="3" class="dialog-description">
					Update will be installed in {{ countdown }} seconds...
				</n-text>
			</div>

			<n-progress
				type="line"
				:show-indicator="false"
				status="success"
				:percentage="progress"
				:color="progressColor"
				processing
			/>
		</div>
	</n-modal>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()

// Computed property for dynamic theme color
const currentThemeColor = computed(() => themeStore.getCurrentThemeColor)

const showDialog = ref(false)
const countdown = ref(5)
const progress = ref(0)
const progressColor = ref(currentThemeColor)

// eslint-disable-next-line
let countdownInterval: any = null
let registration: ServiceWorkerRegistration | null = null
let refreshing = false

const startUpdateCountdown = () => {
	if (showDialog.value) {
		console.log('Dialog already showing, skipping')
		return
	}

	showDialog.value = true
	countdown.value = 5
	progress.value = 0

	// Use requestAnimationFrame for smoother animation
	const startTime = Date.now()
	const duration = 5000 // 5 seconds

	const updateProgress = () => {
		const elapsed = Date.now() - startTime
		progress.value = Math.min((elapsed / duration) * 100, 100)
		countdown.value = Math.ceil(5 - elapsed / 1000)

		if (elapsed < duration) {
			requestAnimationFrame(updateProgress)
		} else {
			performUpdate()
		}
	}

	// Clear any existing interval
	cleanupInterval()

	// Start smooth animation
	requestAnimationFrame(updateProgress)
}

const performUpdate = () => {
	console.log('Performing update')
	cleanupInterval()
	showDialog.value = false

	if (registration?.waiting) {
		registration.waiting.postMessage({ type: 'SKIP_WAITING' })
	}
}

const cleanupInterval = () => {
	if (countdownInterval) {
		clearInterval(countdownInterval)
		countdownInterval = null
	}
}

// Service Worker Setup
onMounted(() => {
	console.log('PWA Update Dialog mounted')

	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.ready.then((reg) => {
			registration = reg
			console.log('Service Worker ready')

			if (reg.waiting) {
				console.log('Found waiting service worker')
				startUpdateCountdown()
			}

			reg.addEventListener('updatefound', () => {
				console.log('Service Worker update found')
				const newWorker = reg.installing
				if (newWorker) {
					newWorker.addEventListener('statechange', () => {
						console.log('Service Worker state changed:', newWorker.state)
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							console.log('New Service Worker installed, showing update dialog')
							startUpdateCountdown()
						}
					})
				}
			})
		})

		navigator.serviceWorker.addEventListener('controllerchange', () => {
			console.log('Service Worker controller changed')
			if (refreshing) return
			refreshing = true
			window.location.reload()
		})
	} else {
		console.log('Service Worker not supported')
	}
})

onUnmounted(() => {
	cleanupInterval()
})
</script>

<style scoped>
.update-dialog-container {
	border-radius: 2rem !important;
}
.update-dialog {
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 20px;
}

.dialog-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	text-align: center;
}

.dialog-title {
	font-size: 18px;
	font-weight: 600;
	color: #1a1a1a;
	margin-bottom: 4px;
}

.dialog-description {
	line-height: 1.5;
	font-size: 14px;
	color: #666;
}

.progress-container {
	width: 100%;
	margin-top: 8px;
}

.progress-track {
	width: 100%;
	height: 3px;
	background-color: #f0f0f0;
	border-radius: 2px;
	overflow: hidden;
	position: relative;
}

.progress-fill {
	height: 100%;
	border-radius: 2px;
	transition: width 16ms linear; /* Very fast transition for smoothness */
	position: relative;
}

.progress-fill::after {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(
		90deg,
		transparent 0%,
		rgba(255, 255, 255, 0.3) 50%,
		transparent 100%
	);
	animation: shimmer 2s infinite;
}

@keyframes shimmer {
	0% {
		transform: translateX(-100%);
	}
	100% {
		transform: translateX(100%);
	}
}

.test-controls {
	position: fixed;
	top: 20px;
	right: 20px;
	z-index: 10000;
	background: white;
	padding: 12px;
	border-radius: 8px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
	border: 1px solid #e0e0e0;
}

.test-button {
	margin-bottom: 12px;
	width: 100%;
}

.color-controls {
	text-align: center;
}

.color-options {
	display: flex;
	gap: 6px;
	justify-content: center;
}

.color-option {
	width: 20px;
	height: 20px;
	border: 2px solid transparent;
	border-radius: 4px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.color-option:hover {
	transform: scale(1.1);
	border-color: #ccc;
}

.color-option:active {
	transform: scale(0.95);
}
</style>
