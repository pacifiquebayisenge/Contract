import type { Database } from '~/types/supabase.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export const useUserStore = defineStore('user', () => {
	// State
	const userId = ref<string | null>(null)
	const profile = ref<ProfileRow | null>(null)
	const partnerProfile = ref<ProfileRow | null>(null)
	const ready = ref(false)

	// Getters
	const getFullname = computed(() => `${profile.value?.firstname} ${profile.value?.lastname}`)

	const getProfileById = computed(() => (id: string): ProfileRow | null => {
		if (profile.value?.id === id) return profile.value
		if (partnerProfile.value?.id === id) return partnerProfile.value
		return null
	})

	const getFullNameById = computed(() => (id: string): string => {
		let p: ProfileRow | null = null

		if (profile.value?.id === id) p = profile.value
		else if (partnerProfile.value?.id === id) p = partnerProfile.value

		if (!p) return 'Unknown User'

		const parts = [p.firstname, p.lastname].filter(Boolean)
		return parts.join(' ') || 'Unknown User'
	})

	// Actions
	async function init() {
		const supabase = useSupabaseClient<Database>()
		const authUser = useSupabaseUser()

		if (!authUser.value) return

		userId.value = authUser.value.sub

		const { data: myProfile } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', userId.value)
			.single()

		if (myProfile) {
			profile.value = myProfile
		}

		const { data: profiles } = await supabase.from('profiles').select('*')

		if (!profiles) return

		partnerProfile.value = profiles.find((p) => p.id !== userId.value) ?? null

		ready.value = true
	}

	async function updateProfile(firstname: string, lastname: string) {
		if (!userId.value) return

		const supabase = useSupabaseClient<Database>()

		const { data, error } = await supabase
			.from('profiles')
			.update({ firstname, lastname })
			.eq('id', userId.value)
			.select('*')
			.single()

		if (!error && data) {
			profile.value = data
		}
	}

	return {
		userId,
		profile,
		partnerProfile,
		ready,
		getFullname,
		getProfileById,
		getFullNameById,
		init,
		updateProfile,
	}
})
