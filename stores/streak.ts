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
		const partner = useUserStore().partnerProfile
		if (!partner) throw new Error('Partner profile is not loaded.')

		const supabase = useSupabaseClient<Database>()
		const { data, error } = await supabase
			.rpc('record_contract_use', { p_partner_id: partner.id })
			.single()

		if (error) throw error
		partner.streak = data.streak
		partner.credit = data.credit

		void $fetch('/api/send-notification', {
			method: 'POST',
			body: { contractId: data.event_id },
		}).catch((error) => console.error('Failed to send Contract notification:', error))
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
