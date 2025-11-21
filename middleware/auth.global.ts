export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const nuxtApp = useNuxtApp()

  const publicPages = ['/signin', '/signup']
  if (publicPages.includes(to.path)) return
  
  // While restoring session, user.value is undefined
  if (user.value === undefined) {
    nuxtApp.$authLoading.show()

    // Force session restore from cookies
    const { data } = await supabase.auth.getSession()

    nuxtApp.$authLoading.hide()

    // If user now exists -> allow entry
    if (data.session?.user) return
  }

  // If user still null after restoring → user is truly logged out
  if (!user.value) return navigateTo('/signin')
})
