export default defineNuxtRouteMiddleware(async (to) => {
	const supabase = useSupabaseClient()

	const publicPages = ['/signin', '/signup']

	// Allow public pages
	if (publicPages.includes(to.path)) {
		return
	}

	// Wait for Supabase to restore session
	const {
		data: { session },
	} = await supabase.auth.getSession()

	// No user/session → go to signin
	if (!session?.user) {
		return navigateTo('/signin')
	}
})
