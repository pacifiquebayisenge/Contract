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
				console.error('❌ Profile not loaded')
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
				console.error('❌ Failed to update seen:', error)
				return
			}

			await this.logSeenUpdate()

			if (data && data.length > 0) {
				userStore.profile!.seen = this.value
			}
		},

		async logSeenUpdate() {
			const supabase = useSupabaseClient<Database>()
			const userStore = useUserStore()

			if (!userStore.profile?.id) {
				console.error('❌ User profile is not loaded, cannot log app open.')
				return
			}

			const { data, error } = await supabase.from('user_events').insert({
				actor_id: userStore.profile!.id,
				target_id: userStore.profile!.id,
				event_type: 'app_open',
			})

			if (error) {
				console.error('❌ Failed to log app open event:', error)
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
