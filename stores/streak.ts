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

		for (let attempt = 0; attempt < 3; attempt++) {
			const { data: current, error: readError } = await supabase
				.from('profiles')
				.select('streak, credit')
				.eq('id', partner.id)
				.single()

			if (readError || !current) {
				console.error('Failed to load partner streak and credit:', readError)
				return
			}

			const nextStreak = current.streak + 1
			// Starting with the fourth use, save the count and the charge together.
			const changes =
				nextStreak > 3
					? { streak: nextStreak, credit: current.credit - 100 }
					: { streak: nextStreak }

			// If another action changed either value, read the latest values and retry.
			const { data: saved, error } = await supabase
				.from('profiles')
				.update(changes)
				.eq('id', partner.id)
				.eq('streak', current.streak)
				.eq('credit', current.credit)
				.select('streak, credit')
				.maybeSingle()

			if (error) {
				console.error('Failed to update streak:', error)
				return
			}

			if (!saved) continue

			partner.streak = saved.streak
			partner.credit = saved.credit

			await $fetch('/api/send-notification', {
				method: 'POST',
				body: {
					title: 'Unbelievable !!',
					body: ` You used Contract again 😒`,
				},
			})
			return
		}

		console.error('Could not register Contract because the partner profile kept changing.')
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
