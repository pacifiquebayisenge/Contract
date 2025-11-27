// plugins/ios-pwa-fix.client.ts
export default defineNuxtPlugin(() => {
  if (process.client) {
    // Only run on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (!isIOS) return

    // Only run if actually installed (standalone)
    const isInStandaloneMode = () =>
      ('standalone' in window.navigator && (window.navigator as any).standalone) ||
      window.matchMedia('(display-mode: standalone)').matches

    if (!isInStandaloneMode()) return

    // THIS IS THE NUCLEAR FIX
    const forceStandalone = () => {
      // Trick iOS into thinking the page was loaded directly
      // by temporarily breaking and restoring the history entry
      window.history.scrollRestoration = 'manual'

      // Tiny delay so it runs after Nuxt navigation finishes
      setTimeout(() => {
        // This forces iOS to hide the UI bars again
        window.scrollTo(0, 1)
        window.scrollTo(0, 0)
      }, 100)
    }

    // Run on every client-side navigation
    const nuxtApp = useNuxtApp()
    nuxtApp.hook('page:finish', forceStandalone)

    // Also run once on initial load too
    onMounted(() => {
      setTimeout(forceStandalone, 300)
    })
  }
})
