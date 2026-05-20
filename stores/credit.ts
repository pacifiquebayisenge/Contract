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

	// update partner credit
	async function updatePartnerCredit(n: number, description?: string) {
		const userStore = useUserStore()
		const supabase = useSupabaseClient<Database>()

		const partner = userStore?.partnerProfile

		if (!partner) {
			console.error('Partner profile is not loaded, cannot update credit.')
			return
		}

		const { data: partnerProfile } = await supabase
			.from('profiles')
			.select('credit')
			.eq('id', partner.id)
			.single()

		if (!partnerProfile) {
			console.error('Partner profile is not found, cannot update credit.')
			return
		}

		const newCredit = (partnerProfile.credit ?? 0) + n

		const { data, error } = await supabase
			.from('profiles')
			.update({ credit: newCredit })
			.eq('id', partner.id)
			.select('*')

		if (error) {
			console.error(`Failed to update credit with ${n}:`, error)
			return
		}

		console.error(`${partner.firstname} ' credit updated with ${n}`)
		userStore.partnerProfile!.credit = newCredit

		if (n > 0) await rewardNotif(description!)
	}

	async function rewardNotif(description: string) {
		await $fetch('/api/send-notification', {
			method: 'POST',
			body: {
				title: "you've earned a reward 🥳",
				body: `${description}`,
			},
		})
	}

	function init() {
		const userStore = useUserStore()
		setCredit(userStore.profile?.credit ?? 0)
	}

	return {
		value,
		setCredit,
		updateCredit,
		updatePartnerCredit,
		init,
	}
})
