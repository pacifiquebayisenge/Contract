export default defineNuxtPlugin(() => {
  // Only run inside PWA (installed standalone)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true

  if (!isStandalone) return

  const router = useRouter()

  // If first loaded page is NOT the start_url (/)
  if (window.location.pathname !== '/') {
    const intended = window.location.pathname + window.location.search + window.location.hash

    // Force iOS to load the homepage (required to keep standalone)
    window.history.replaceState({}, '', '/')

    // After Vue hydrates, move to the correct route
    requestAnimationFrame(() => {
      router.replace(intended)
    })
  }
})
