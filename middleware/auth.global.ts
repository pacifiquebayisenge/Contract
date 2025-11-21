export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const nuxtApp = useNuxtApp()

  const publicPages = ['/signin', '/signup']
  if (publicPages.includes(to.path)) return

  // Already logged in → OK
  if (user.value) return

  // Try restoring session from cookies
  nuxtApp.$authLoading.show()

  const { data } = await supabase.auth.getSession()

  nuxtApp.$authLoading.hide()

  // Supabase session restored?
  if (data.session?.user) {
    // This updates Nuxt's internal auth state properly.
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    })

    return
  }

  // Not logged in → redirect
  return navigateTo('/signin')
})
