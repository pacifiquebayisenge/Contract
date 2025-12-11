import type { Database } from '~/types/supabase.types'
import { useUserStore } from './user'

type ContractRule = Database['public']['Tables']['contract_rules']['Row']
type ContractRuleInsert = Database['public']['Tables']['contract_rules']['Insert']
type ContractRuleUpdate = Database['public']['Tables']['contract_rules']['Update']

export const useContractStore = defineStore('contract', {
	state: () => ({
		contractList: [] as ContractRule[],
	}),

	getters: {
		getContractList: (s) => s.contractList,
	},

	actions: {
		async fetchContractList() {
			const supabase = useSupabaseClient<Database>()

			const { data: contractList } = await supabase
				.from('contract_rules')
				.select('*')
				.order('created_at', { ascending: false })

			this.contractList = contractList ?? []
		},

		async addContractRule(title: string, description: string) {
			const userStore = useUserStore()
			const supabase = useSupabaseClient<Database>()

			const profile = userStore.profile

			if (!profile) {
				console.error('Profile not loaded')
				return
			}

			const newContractRule: ContractRuleInsert = {
				title,
				description,
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
				this.contractList.push(data)
			}

			return data
		},

		async updateContractRule(id: string, updates: { title?: string; description?: string }) {
			const supabase = useSupabaseClient<Database>()

			const updatedContractRule = { ...updates, state: 'Pending' }

			const { data, error } = await supabase
				.from('contract_rules')
				.update(updatedContractRule)
				.eq('id', id)
				.select()
				.single()

			if (error) {
				console.error('Error updating contract rule:', error)
				throw error
			}

			await this.fetchContractList()
		},

		async deleteContractRule(id: string) {
			const supabase = useSupabaseClient<Database>()

			const { error } = await supabase.from('contract_rules').delete().eq('id', id)

			if (error) {
				console.error('Error deleting contract rule:', error)
				throw error
			}

			// Remove from local state
			this.contractList = this.contractList.filter((c) => c.id !== id)
		},

		async init() {
			await this.fetchContractList()
		},
	},
})
