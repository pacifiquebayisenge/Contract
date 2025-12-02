import type { Database } from '~/types/supabase.types'
import { useCreditStore } from './credit'
import { useUserStore } from './user'

// only can manage partner violation
//TODO: CLEAN UP
// TODO: crime instead of violation ?
export const useViolationStore = defineStore('violation', {
	state: () => ({
		value: 0,
	}),

	getters: {
		getViolationCount: (s) => s.value,
	},

	actions: {
		setViolation(n: number) {
			this.value = n
		},

		async updatePartnerViolation() {
			const supabase = useSupabaseClient<Database>()
			const userStore = useUserStore()
			const creditStore = useCreditStore()

			const partner = userStore.partnerProfile

			if (!partner) {
				console.error('partnerProfile is not loaded, cannot update violation.')
				return
			}

			const newViolation = partner.violation + 1

			const { data, error } = await supabase
				.from('profiles')
				.update({
					violation: newViolation,
				})
				// partner !! only when partner uses his violation
				.eq('id', partner.id)
				.select('*')

			if (error) {
				console.error('Failed to update violation:', error)
				return
			}

			if (data && data.length > 0) {
				console.log('Violation updated:', `${data[0].firstname}: violation ${data[0].violation}`)
				userStore.partnerProfile!.violation = newViolation

				await creditStore.reducePartnerCredit(100)
			}

			await $fetch('/api/send-notification', {
				method: 'POST',
				body: {
					title: 'Shamefull !! 😡',
					body: ` You violated a contract rule again 🤬`,
				},
			})
		},

		// async resetViolation() {
		// 	const supabase = useSupabaseClient<Database>()
		// 	const userStore = useUserStore()

		// 	const partner = userStore.partnerProfile

		// 	if (!partner) {
		// 		console.error('partnerProfile is not loaded, cannot update violation.')
		// 		return
		// 	}
		// 	const newViolation = 0
		// 	this.setViolation(newViolation)

		// 	const { data, error } = await supabase
		// 		.from('profiles')
		// 		.update({
		// 			violation: newViolation,
		// 		})
		// 		.eq('id', partner.id)
		// 		.select('*')

		// 	if (error) {
		// 		console.error('Failed to reset violation:', error)
		// 		return
		// 	}

		// 	if (data && data.length > 0) {
		// 		console.log('Violation reset:', `${data[0].firstname}: violation ${data[0].violation}`)
		// 		userStore.partnerProfile!.violation = this.value
		// 	}
		// },

		init() {
			const userStore = useUserStore()

			const violation = userStore.profile!.violation ?? 0
			this.setViolation(violation)
		},
	},
})
