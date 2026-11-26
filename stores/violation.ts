import type { Database } from '~/types/supabase.types'
import { useUserStore } from './user'

// Only manages partner violation
export const useViolationStore = defineStore('violation', () => {
	// State
	const value = ref(0)

	// Actions
	function setViolation(n: number) {
		value.value = n
	}

	async function updatePartnerViolation(ruleId: string) {
		const supabase = useSupabaseClient<Database>()
		const userStore = useUserStore()

		const partner = userStore.partnerProfile

		if (!partner) {
			throw new Error('Partner profile is not loaded.')
		}

		const { data, error } = await supabase
			.rpc('record_contract_violation', {
				p_rule_id: ruleId,
				p_partner_id: partner.id,
			})
			.single()

		if (error) throw error

		partner.violation = data.violation
		partner.credit = data.credit

		// The violation is already saved. A push failure should never prompt a second charge.
		void $fetch('/api/send-notification', {
			method: 'POST',
			body: {
				title: 'Shamefull !! 😡',
				body: `You violated: ${data.rule_title}`,
			},
		}).catch((error) => console.error('Failed to send violation notification:', error))
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
