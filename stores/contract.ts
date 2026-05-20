import { capitalize } from 'vue'
import type { Database } from '~/types/supabase.types'
import { useUserStore } from './user'

type ContractRule = Database['public']['Tables']['contract_rules']['Row']
type ContractRuleInsert = Database['public']['Tables']['contract_rules']['Insert']

export const useContractStore = defineStore('contract', () => {
	// State
	const contractList = ref<ContractRule[]>([])

	// Actions
	async function fetchContractList() {
		contractList.value = []
		const supabase = useSupabaseClient<Database>()

		const { data } = await supabase
			.from('contract_rules')
			.select('*')
			.order('created_at', { ascending: false })

		contractList.value = data ?? []
	}

	async function addContractRule(title: string, description: string) {
		const userStore = useUserStore()
		const supabase = useSupabaseClient<Database>()

		const profile = userStore.profile

		if (!profile) {
			console.error('Profile not loaded')
			return
		}

		const newContractRule: ContractRuleInsert = {
			title: capitalize(title),
			description: capitalize(description),
			author: profile.id,
		}

		const { data, error } = await supabase
			.from('contract_rules')
			.insert(newContractRule)
			.select()
			.single()

		if (error) {
			console.error('Error inserting contract:', error)
			throw error
		}

		if (data) {
			contractList.value.unshift(data)
		}

		return data
	}

	async function updateContractRule(id: string, updates: { title?: string; description?: string }) {
		const supabase = useSupabaseClient<Database>()

		const updatedContractRule: Record<string, string> = { state: 'Pending' }

		if (updates.title) updatedContractRule.title = capitalize(updates.title)
		if (updates.description) updatedContractRule.description = capitalize(updates.description)

		const { error } = await supabase
			.from('contract_rules')
			.update(updatedContractRule)
			.eq('id', id)
			.select()
			.single()

		if (error) {
			console.error('Error updating contract rule:', error)
			throw error
		}

		await fetchContractList()
	}

	async function deleteContractRule(id: string) {
		const supabase = useSupabaseClient<Database>()

		const { error } = await supabase.from('contract_rules').delete().eq('id', id)

		if (error) {
			console.error('Error deleting contract rule:', error)
			throw error
		}

		contractList.value = contractList.value.filter((c: { id: string }) => c.id !== id)
	}

	async function init() {
		await fetchContractList()
	}

	return {
		contractList,
		fetchContractList,
		addContractRule,
		updateContractRule,
		deleteContractRule,
		init,
	}
})
