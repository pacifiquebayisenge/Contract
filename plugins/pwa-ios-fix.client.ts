// plugins/ios-pwa-fix.client.ts
export default defineNuxtPlugin(() => {
	console.log('[iOS-PWA-FIX] 🔌 Plugin initialized (client-side)')

	if (!process.client) {
		console.log('[iOS-PWA-FIX] ❌ Skipped: Not client-side')
		return
	}

	// Only run on iOS
	const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
	console.log('[iOS-PWA-FIX] 📱 isIOS check:', isIOS)
	if (!isIOS) {
		console.log('[iOS-PWA-FIX] ❌ Skipped: Not iOS')
		return
	}

	// Only run if actually installed (standalone)
	const isInStandaloneMode = () =>
		('standalone' in window.navigator && (window.navigator as any).standalone) ||
		window.matchMedia('(display-mode: standalone)').matches

	const standalone = isInStandaloneMode()
	console.log('[iOS-PWA-FIX] 🏠 isInStandaloneMode check:', standalone)
	if (!standalone) {
		console.log('[iOS-PWA-FIX] ❌ Skipped: Not in standalone mode')
		return
	}

	console.log('[iOS-PWA-FIX] ✅ All checks passed – proceeding with fixes')

	// THIS IS THE NUCLEAR FIX
	const forceStandalone = () => {
		console.log('[iOS-PWA-FIX] 💥 forceStandalone called')
		// Trick iOS into thinking the page was loaded directly
		window.history.scrollRestoration = 'manual'

		// Tiny delay so it runs after Nuxt navigation finishes
		setTimeout(() => {
			console.log('[iOS-PWA-FIX] 📜 Scrolling to force UI hide')
			window.scrollTo(0, 1)
			window.scrollTo(0, 0)
		}, 100)
	}

	// Run on every client-side navigation (with fallback logging)
	const nuxtApp = useNuxtApp()
	nuxtApp.hook('page:finish', () => {
		console.log('[iOS-PWA-FIX] 🎣 page:finish hook fired')
		forceStandalone()
	})

	// Also run once on initial load too
	if (process.client) {
		onMounted(() => {
			console.log('[iOS-PWA-FIX] 🏁 onMounted fired')
			setTimeout(forceStandalone, 300)
		})
	}

	// EXTRA: Log if hook ever fails to fire (test after navigation)
	console.log('[iOS-PWA-FIX] 🛡️ Hook registered – navigate to test')
})
