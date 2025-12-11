import { defineStore } from 'pinia'
import type { Database } from '~/types/supabase.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export const useUserStore = defineStore('user', {
	state: () => ({
		userId: null as string | null,
		profile: null as ProfileRow | null,
		partnerProfile: null as ProfileRow | null,

		ready: false,
	}),

	getters: {
		getProfileById: (state) => {
			return (id: string): ProfileRow | null => {
				if (state.profile?.id === id) return state.profile
				if (state.partnerProfile?.id === id) return state.partnerProfile
				return null
			}
		},
		getFullNameById: (state) => {
			return (id: string): string => {
				let profile: ProfileRow | null = null

				if (state.profile?.id === id) profile = state.profile
				else if (state.partnerProfile?.id === id) profile = state.partnerProfile

				if (!profile) return 'Unknown User'

				const parts = [profile.firstname, profile.lastname].filter(Boolean)
				return parts.join(' ') || 'Unknown User'
			}
		},
	},

	actions: {
		async init() {
			const supabase = useSupabaseClient<Database>()
			const authUser = useSupabaseUser()

			if (!authUser.value) return

			// YOUR ID
			this.userId = authUser.value.sub

			// Load your profile
			const { data: myProfile } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', this.userId)
				.single()

			if (myProfile) {
				this.profile = myProfile
			}

			// Load both profiles (2 total)
			const { data: profiles } = await supabase.from('profiles').select('*')

			if (!profiles) return

			// Find your partner
			this.partnerProfile = profiles.find((p) => p.id !== this.userId) ?? null

			this.ready = true
		},

		async updateProfile(firstname: string, lastname: string) {
			if (!this.userId) return

			const supabase = useSupabaseClient<Database>()

			const { data, error } = await supabase
				.from('profiles')
				.update({
					firstname,
					lastname,
				})
				.eq('id', this.userId)
				.select('*')
				.single()

			if (!error && data) {
				this.profile = data // update local state
			}
		},
	},
})
