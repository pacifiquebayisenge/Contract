import type { Database } from '~/types/supabase.types'
import { useUserStore } from './user'

export const useCreditStore = defineStore('credit', () => {
	// State
	const value = ref(0)

	// Actions
	function setCredit(n: number) {
		value.value = n
	}

	// update my credit
	async function updateCredit(n: number) {
		const userStore = useUserStore()
		const supabase = useSupabaseClient<Database>()

		const { data: profile } = await supabase
			.from('profiles')
			.select('credit')
			.eq('id', userStore.profile!.id)
			.single()

		if (!profile) return

		const newCredit = (profile.credit ?? 0) + n

		const { data, error } = await supabase
			.from('profiles')
			.update({ credit: newCredit })
			.eq('id', userStore.profile!.id)
			.select('*')

		if (error) return

		value.value = newCredit
		userStore.profile!.credit = newCredit
	}

	async function givePartnerReward(amount: number, description: string) {
		const partner = useUserStore().partnerProfile
		if (!partner) throw new Error('Partner profile is not loaded.')

		const supabase = useSupabaseClient<Database>()
		const { data, error } = await supabase
			.rpc('record_partner_reward', {
				p_partner_id: partner.id,
				p_amount: amount,
				p_description: description,
			})
			.single()

		if (error) throw error
		partner.credit = data.credit

		// A push error must not prompt a second reward after the database commit.
		void $fetch('/api/send-notification', {
			method: 'POST',
			body: { rewardId: data.reward_id },
		}).catch((error) => console.error('Failed to send reward notification:', error))
	}

	function init() {
		const userStore = useUserStore()
		setCredit(userStore.profile?.credit ?? 0)
	}

	return {
		value,
		setCredit,
		updateCredit,
		givePartnerReward,
		init,
	}
})
