import type { Database } from '~/types/supabase.types'
import { useUserStore } from './user'

// Only manages partner streak
// TODO: CLEAN UP
export const useStreakStore = defineStore('streak', () => {
	// State
	const value = ref(0)

	// Actions
	function setStreak(n: number) {
		value.value = n
	}

	async function updatePartnerStreak() {
		const supabase = useSupabaseClient<Database>()
		const userStore = useUserStore()

		const partner = userStore.partnerProfile

		if (!partner) {
			console.error('Partner profile is not loaded, cannot update streak.')
			return
		}

		const newStreak = partner.streak + 1

		const { data, error } = await supabase
			.from('profiles')
			.update({ streak: newStreak })
			.eq('id', partner.id)
			.select('*')

		if (error) {
			console.error('Failed to update streak:', error)
			return
		}

		if (data && data.length > 0) {
			userStore.partnerProfile!.streak = newStreak
		}

		await $fetch('/api/send-notification', {
			method: 'POST',
			body: {
				title: 'Unbelievable !!',
				body: ` You used Contract again 😒`,
			},
		})
	}

	async function resetPartnerStreak() {
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
			.update({ streak: newStreak })
			.eq('id', partner.id)
			.select('*')

		if (error) {
			console.error('Failed to reset streak:', error)
			return
		}

		if (data && data.length > 0) {
			console.log('Streak reset:', `${data[0]?.firstname}: streak ${data[0]?.streak}`)
			userStore.partnerProfile!.streak = newStreak
		}
	}

	function init() {
		const userStore = useUserStore()
		setStreak(userStore.profile?.streak ?? 0)
	}

	return {
		value,
		setStreak,
		updatePartnerStreak,
		resetPartnerStreak,
		init,
	}
})
