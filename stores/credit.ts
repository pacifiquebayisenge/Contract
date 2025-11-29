import type { Database } from '~/types/supabase.types'
import { useUserStore } from './user'

export const useCreditStore = defineStore('credit', {
	state: () => ({
		value: 0,
	}),

	getters: {
		getCreditCount: (s) => s.value,
	},

	actions: {
		setCredit(n: number) {
			this.value = n
		},

		// user will get credit increase everyday
		async updateCredit(n: number) {
			const newCredit = this.value + n
			this.setCredit(newCredit)

			const userStore = useUserStore()
			const supabase = useSupabaseClient<Database>()

			const { data, error } = await supabase
				.from('profiles')
				.update({
					credit: newCredit,
				})
				.eq('id', userStore.profile!.id)

				.select('*')

			if (error) {
				console.error('Failed to update credit:', error)
				return
			}

			if (data && data.length > 0) {
				console.log('Credit updated:', `${data[0].firstname}: credit ${data[0].credit}`)
				userStore.profile!.credit = this.value
			}
		},

		// user will get credit increase everyday
		async reduceCredit(n: number) {
			const supabase = useSupabaseClient<Database>()
			const userStore = useUserStore()

			const partner = userStore.partnerProfile

			if (!partner) {
				console.error('partnerProfile is not loaded, cannot update streak.')
				return
			}

			const newCredit = partner.credit! - n

			const { data, error } = await supabase
				.from('profiles')
				.update({
					credit: newCredit,
				})
				.eq('id', partner.id)

				.select('*')

			if (error) {
				console.error('Failed to reduce credit:', error)
				return
			}

			if (data && data.length > 0) {
				console.log('Credit reduced:', `${data[0].firstname}: credit ${data[0].credit}`)
				userStore.partnerProfile!.credit = newCredit
			}
		},

		init() {
			const userStore = useUserStore()
			const credit = userStore.profile!.credit || 0

			this.setCredit(credit)
		},
	},
})
