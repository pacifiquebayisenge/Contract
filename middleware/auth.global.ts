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
		if (to.path === '/shop' && typeof to.query.item === 'string') {
			return navigateTo({ path: '/signin', query: { shopItem: to.query.item } })
		}
		const { violation, reward, contract } = to.query
		return navigateTo({
			path: '/signin',
			query: typeof contract === 'string' ? { contract } : typeof reward === 'string' ? { reward } : typeof violation === 'string' ? { violation } : {},
		})
	}
})
