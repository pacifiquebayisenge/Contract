import type { Database } from '~/types/supabase.types'
import { useUserStore } from './user'

// only can manage partner streak
//TODO: CLEAN UP
export const useStreakStore = defineStore('streak', {
	state: () => ({
		value: 0,
	}),

	getters: {
		getStreakCount: (s) => s.value,
	},

	actions: {
		setStreak(n: number) {
			this.value = n
		},

		async updatePartnerStreak() {
			const supabase = useSupabaseClient<Database>()
			const userStore = useUserStore()

			const partner = userStore.partnerProfile

			if (!partner) {
				console.error('partnerProfile is not loaded, cannot update streak.')
				return
			}

			const newStreak = partner.streak + 1

			const { data, error } = await supabase
				.from('profiles')
				.update({
					streak: newStreak,
				})
				// partner !! only when partner uses his streak
				.eq('id', partner.id)
				.select('*')

			if (error) {
				console.error('Failed to update streak:', error)
				return
			}

			if (data && data.length > 0) {
				// console.log('Streak updated:', `${data[0].firstname}: streak ${data[0].streak}`)
				userStore.partnerProfile!.streak = newStreak
			}

			await $fetch('/api/send-notification', {
				method: 'POST',
				body: {
					title: 'Unbelievable !!',
					body: ` You used Contract again 😒`,
				},
			})
		},

		async resetPartnerStreak() {
			const supabase = useSupabaseClient<Database>()
			const userStore = useUserStore()

			const partner = userStore.partnerProfile

			if (!partner) {
				console.error('partnerProfile is not loaded, cannot update streak.')
				return
			}

			const newStreak = 0

			const { data, error } = await supabase
				.from('profiles')
				.update({
					streak: newStreak,
				})
				.eq('id', partner.id)
				.select('*')

			if (error) {
				console.error('Failed to reset streak:', error)
				return
			}

			if (data && data.length > 0) {
				console.log('Streak reset:', `${data[0].firstname}: streak ${data[0].streak}`)
				userStore.partnerProfile!.streak = newStreak
			}
		},

		init() {
			const userStore = useUserStore()

			const streak = userStore.profile!.streak || 0
			this.setStreak(streak)
		},
	},
})
