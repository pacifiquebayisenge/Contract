<!-- components/PWAInstallPrompt.vue -->
<template>
	<n-modal
		v-model:show="showDialog"
		:mask-closable="false"
		:closable="true"
		style="width: 420px; border-radius: 2rem !important"
		preset="card"
		:bordered="true"
		class="install-dialog-container"
		@close="handleClose"
	>
		<div class="install-dialog">
			<div class="dialog-content">
				<div class="icon-container">
					<n-icon size="64" :color="currentThemeColor">
						<DownloadIcon />
					</n-icon>
				</div>

				<n-text class="dialog-title">Install Ugovor App</n-text>

				<n-text depth="3" class="dialog-description">
					Install the app for a better experience with faster loading and offline access.
				</n-text>

				<div class="features-list">
					<div class="feature-item">
						<n-icon size="18" :color="currentThemeColor" class="check-icon">
							<CheckIcon />
						</n-icon>
						<n-text depth="3" class="feature-text">Fast loading</n-text>
					</div>
					<div class="feature-item">
						<n-icon size="18" :color="currentThemeColor" class="check-icon">
							<CheckIcon />
						</n-icon>
						<n-text depth="3" class="feature-text">Works offline</n-text>
					</div>
					<div class="feature-item">
						<n-icon size="18" :color="currentThemeColor" class="check-icon">
							<CheckIcon />
						</n-icon>
						<n-text depth="3" class="feature-text">Home screen access</n-text>
					</div>
				</div>
			</div>

			<div class="dialog-actions">
				<n-button secondary @click="dismissPrompt" class="action-btn secondary-btn" size="large">
					Not Now
				</n-button>
				<n-button
					type="primary"
					@click="installApp"
					class="action-btn primary-btn"
					size="large"
					:color="currentThemeColor"
				>
					Install Now
				</n-button>
			</div>
		</div>
	</n-modal>
</template>

<script setup lang="ts">
import { h, onMounted, onUnmounted, ref } from 'vue'
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()

// Computed property for dynamic theme color
const currentThemeColor = computed(() => themeStore.themeColor)

const showDialog = ref(false)
let deferredPrompt: any = null
let showTimeout: any = null
let isAppInstalled = ref(false)

// Icons
const DownloadIcon = () =>
	h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [
		h('path', {
			d: 'M19,9H15V3H9V9H5L12,16L19,9M5,18V20H19V18H5Z',
		}),
	])

const CheckIcon = () =>
	h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [
		h('path', {
			d: 'M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z',
		}),
	])

// Check if app is already installed
const checkAppInstalled = () => {
	// Check if in standalone mode (installed)
	if (window.matchMedia('(display-mode: standalone)').matches) {
		isAppInstalled.value = true
		return true
	}

	// Check if in standalone mode (iOS)
	if ('standalone' in window.navigator && (window.navigator as any).standalone) {
		isAppInstalled.value = true
		return true
	}

	return false
}

const showInstallPrompt = () => {
	if (checkAppInstalled()) {
		console.log('App is already installed')
		return
	}

	if (deferredPrompt && !isAppInstalled.value) {
		console.log('Showing install prompt')
		showDialog.value = true
	}
}

const installApp = async () => {
	if (deferredPrompt) {
		deferredPrompt.prompt()
		const { outcome } = await deferredPrompt.userChoice

		if (outcome === 'accepted') {
			console.log('User accepted the install prompt')
			isAppInstalled.value = true
			localStorage.setItem('pwa-install-dismissed', 'true')
		} else {
			console.log('User dismissed the install prompt')
		}

		deferredPrompt = null
		showDialog.value = false
	}
}

const dismissPrompt = () => {
	showDialog.value = false
	// Remember dismissal for 30 days
	localStorage.setItem('pwa-install-dismissed', 'true')
	const expiry = new Date()
	expiry.setDate(expiry.getDate() + 30)
	localStorage.setItem('pwa-install-dismissed-expiry', expiry.toISOString())
}

const handleClose = () => {
	dismissPrompt()
}

// Check if prompt was recently dismissed
const shouldShowPrompt = () => {
	const dismissed = localStorage.getItem('pwa-install-dismissed')
	if (!dismissed) return true

	const expiry = localStorage.getItem('pwa-install-dismissed-expiry')
	if (expiry && new Date() > new Date(expiry)) {
		localStorage.removeItem('pwa-install-dismissed')
		localStorage.removeItem('pwa-install-dismissed-expiry')
		return true
	}

	return false
}

onMounted(() => {
	// Check if already installed
	if (checkAppInstalled()) {
		console.log('PWA already installed')
		return
	}

	// Listen for beforeinstallprompt event
	window.addEventListener('beforeinstallprompt', (e) => {
		e.preventDefault()
		deferredPrompt = e
		console.log('beforeinstallprompt event fired')

		// Show prompt after 10 seconds if not dismissed recently
		if (shouldShowPrompt()) {
			showTimeout = setTimeout(() => {
				showInstallPrompt()
			}, 10000) // 10 seconds
		}
	})

	// Listen for app installed event
	window.addEventListener('appinstalled', () => {
		console.log('PWA was installed')
		isAppInstalled.value = true
		showDialog.value = false
		deferredPrompt = null
		if (showTimeout) {
			clearTimeout(showTimeout)
		}
	})

	// Additional check for iOS (which doesn't support beforeinstallprompt)
	const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
	const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

	if ((isIOS || isSafari) && shouldShowPrompt() && !checkAppInstalled()) {
		showTimeout = setTimeout(() => {
			showDialog.value = true
		}, 10000)
	}
})

onUnmounted(() => {
	if (showTimeout) {
		clearTimeout(showTimeout)
	}

	// Clean up event listeners
	window.removeEventListener('beforeinstallprompt', () => {})
	window.removeEventListener('appinstalled', () => {})
})
</script>

<style scoped>
.install-dialog-container {
	border-radius: 2rem !important;
}

.install-dialog {
	display: flex;
	flex-direction: column;
	gap: 24px;
	padding: 24px;
}

.dialog-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
	text-align: center;
}

.icon-container {
	margin-bottom: 8px;
}

.dialog-title {
	font-size: 22px;
	font-weight: 700;
	color: #1a1a1a;
	margin-bottom: 4px;
}

.dialog-description {
	line-height: 1.5;
	font-size: 15px;
	color: #666;
	max-width: 320px;
}

.features-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
	width: 100%;
	max-width: 280px;
	margin-top: 8px;
}

.feature-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 10px 14px;
	background: #f8f9fa;
	border-radius: 10px;
	border: 1px solid #e8e8e8;
}

.check-icon {
	flex-shrink: 0;
}

.feature-text {
	font-size: 14px;
	font-weight: 500;
}

.dialog-actions {
	display: flex;
	gap: 16px;
	justify-content: center;
	margin-top: 16px;
}

.action-btn {
	min-width: 140px;
	height: 72px !important; /* Bigger height */
	border-radius: 2rem !important; /* More rounded */
	font-weight: 600;
	font-size: 16px !important; /* Larger text */
	transition: all 0.2s ease;
}

.primary-btn {
	box-shadow: 0 4px 14px rgba(24, 160, 88, 0.3);
}

.primary-btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(24, 160, 88, 0.4);
}

.secondary-btn {
	border: 2px solid #e0e0e0;
	background: white;
}

.secondary-btn:hover {
	background: #f8f9fa;
	border-color: #d0d0d0;
	transform: translateY(-1px);
}

/* Responsive design */
@media (max-width: 480px) {
	.install-dialog {
		padding: 20px;
		gap: 20px;
	}

	.dialog-actions {
		flex-direction: column;
		gap: 12px;
	}

	.action-btn {
		min-width: 100%;
		height: 48px !important;
	}
}
</style>
