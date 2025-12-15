import type { Database } from '~/types/supabase.types'
import { useUserStore } from './user'

export const useSeenStore = defineStore('seen', {
	state: () => ({
		value: 0,
	}),

	getters: {
		getSeenCount: (s) => s.value,
	},

	actions: {
		setSeen(n: number) {
			this.value = n
		},

		async updateSeen() {
			const userStore = useUserStore()
			const supabase = useSupabaseClient<Database>()

			const profile = userStore.profile

			if (!profile) {
				console.error('Profile not loaded')
				return
			}

			const newSeen = this.value + 1
			this.setSeen(newSeen)

			const { data, error } = await supabase
				.from('profiles')
				.update({
					seen: newSeen,
				})
				.eq('id', profile.id)
				.select('*')

			if (error) {
				console.error('Failed to update seen:', error)
				return
			}

			await this.logSeenUpdate(newSeen)

			if (data && data.length > 0) {
				// console.log('Seen updated:', `${data[0].firstname}: seen ${data[0].seen}`)
				userStore.profile!.seen = this.value
			}
		},

		async logSeenUpdate(newSeen: number) {
			const supabase = useSupabaseClient<Database>()
			const userStore = useUserStore()

			const partner = userStore.partnerProfile

			if (!partner) {
				console.error('Partner profile is not loaded, cannot log seen update.')
				return
			}

			const { data, error } = await supabase.from('seen_history').insert({
				user_id: userStore.profile!.id,
				seen_value: newSeen,
				updated_by: userStore.profile!.id,
				source_action: 'increment',
			})

			if (error) {
				console.error('Failed to log seen update:', error)
				return
			}
		},

		init() {
			const userStore = useUserStore()
			const seen = userStore.profile?.seen || 0
			this.setSeen(seen)
		},
	},
})
