export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  const nuxtApp = useNuxtApp()

  const publicPages = ["/signin", "/signup"]
  
  if (publicPages.includes(to.path)) return

  if (user.value === undefined) {
    nuxtApp.$authLoading.show()
    await supabase.auth.getSession()
    nuxtApp.$authLoading.hide()
  }

  if (!user.value) return navigateTo("/signin")
})
