export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  const nuxtApp = useNuxtApp()

  const publicPages = ["/signin", "/signup"]
  if (publicPages.includes(to.path)) return

  // Wait for session restore if user is undefined
  if (user.value === undefined) {
    nuxtApp.$authLoading.show()

    // Restore session
    await supabase.auth.getSession()

    // WAIT until Pinia updates user
    await new Promise(resolve => setTimeout(resolve, 0))

    nuxtApp.$authLoading.hide()
  }

  // After session loads
  if (!user.value) {
    return navigateTo("/signin")
  }
})
