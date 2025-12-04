import { nextTick } from 'vue'

export default defineNuxtPlugin(() => {
	if (!import.meta.client) return

	const nuxtApp = useNuxtApp()

	nuxtApp.hook('app:mounted', async () => {
		console.log('🌍 App fully mounted — push system activating')

		// --- CHECK IF NOTIFICATIONS API EXISTS ---
		if (typeof window === 'undefined' || !('Notification' in window)) {
			console.log('📵 Notifications API not available in this browser/mode.')
			return
		}

		// --- CHECK IF SERVICE WORKER IS SUPPORTED ---
		if (!('serviceWorker' in navigator)) {
			console.log('❌ No service worker support')
			return
		}

		// --- iOS SAFARI BROWSER CHECK (not PWA) ---
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches
		const isIOSSafari = isIOS && !isStandalone

		if (isIOSSafari) {
			console.log('📵 iOS Safari browser detected. Push notifications only work in installed PWA.')
			console.log('💡 Please "Add to Home Screen" to enable notifications.')
			return
		}

		// --- ANDROID/DESKTOP BROWSER CHECK ---
		const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

		if (isSafari && !isStandalone) {
			console.log('📵 Safari browser detected — push notifications work best in PWA mode.')
			// Continue anyway on desktop Safari
		}

		const config = useRuntimeConfig()
		const user = useSupabaseUser()

		await nextTick()
		console.log('👤 Supabase user:', user.value)

		// Try to sync any pending subscriptions first
		const { syncPendingSubscription } = usePushNotifications()
		await syncPendingSubscription()

		// If permission already granted → register SW
		if (Notification.permission === 'granted') {
			console.log('🔔 Permission already granted — setting up subscription')
			await setupPushSubscription(config)
		} else {
			console.log('🔕 Permission NOT granted — waiting for user toggle')
		}
	})
})

async function setupPushSubscription(config: any) {
	try {
		console.log('🔧 Setting up push subscription…')

		// Wait for service worker to be ready (auto-registered by @vite-pwa/nuxt)
		// The PWA module handles registration automatically
		if (!navigator.serviceWorker.controller) {
			console.log('⏳ Waiting for service worker controller...')
			await new Promise((resolve) => setTimeout(resolve, 1000))
		}

		const registration = await navigator.serviceWorker.ready
		console.log('✅ Service worker ready:', registration.scope)

		let subscription = await registration.pushManager.getSubscription()

		if (!subscription) {
			subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(config.public.publicVapid),
			})
		}

		console.log('⬆ Saving subscription to backend')

		try {
			await $fetch('/api/save-subscription', {
				method: 'POST',
				body: subscription.toJSON(),
			})
			console.log('✅ Subscription saved successfully')
		} catch (error: any) {
			console.error('❌ Failed to save subscription:', error)

			// If API is not available (static build), store for later
			if (error.status === 404 || error.statusCode === 404) {
				console.warn('⚠️ API not available. Use "pnpm build && pnpm start" for full functionality')
				localStorage.setItem('pending-push-subscription', JSON.stringify(subscription.toJSON()))
			}
		}
	} catch (error) {
		console.error('❌ Error in setupPushSubscription:', error)
	}
}

function urlBase64ToUint8Array(base64String: string) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
	const rawData = atob(base64)
	const outputArray = new Uint8Array(rawData.length)
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i)
	}
	return outputArray
}
