import type { Database } from '~/types/supabase.types'
import { useCreditStore } from './credit'
import { useUserStore } from './user'

// Only manages partner violation
// TODO: CLEAN UP
// TODO: crime instead of violation?
export const useViolationStore = defineStore('violation', () => {
	// State
	const value = ref(0)

	// Actions
	function setViolation(n: number) {
		value.value = n
	}

	async function updatePartnerViolation() {
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
			.update({ violation: newViolation })
			.eq('id', partner.id)
			.select('*')

		if (error) {
			console.error('Failed to update violation:', error)
			return
		}

		if (data && data.length > 0) {
			userStore.partnerProfile!.violation = newViolation

			await creditStore.updatePartnerCredit(-100)
		}

		await $fetch('/api/send-notification', {
			method: 'POST',
			body: {
				title: 'Shamefull !! 😡',
				body: ` You violated a contract rule again 🤬`,
			},
		})
	}

	function init() {
		const userStore = useUserStore()
		setViolation(userStore.profile!.violation ?? 0)
	}

	return {
		value,
		setViolation,
		updatePartnerViolation,
		init,
	}
})
