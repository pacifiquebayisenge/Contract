import { defineStore } from 'pinia'
import type { Database } from '~/types/supabase.types'

export const usePseudoStore = defineStore('pseudo', {
	state: () => ({
		userId: null as string | null,
		partnerId: null as string | null,

		myPseudo: null as string | null,
		partnerPseudo: null as string | null,

		ready: false,
	}),

	actions: {
		async init() {
			const supabase = useSupabaseClient<Database>()
			const authUser = useSupabaseUser()

			if (!authUser.value) return
			this.userId = authUser.value.sub

			// Get both user IDs (only 2 users exist)
			const { data: profiles } = await supabase.from('profiles').select('id')

			if (!profiles) return

			// Partner is the user with a different id
			this.partnerId = profiles.find((p) => p.id !== this.userId)?.id ?? null

			// Fetch all pseudo rows
			const { data: pseudos } = await supabase.from('partner_pseudos').select('*')

			if (pseudos) {
				// Pseudo your partner gave YOU:
				this.myPseudo =
					pseudos.find((p) => p.owner_id === this.userId && p.partner_id === this.partnerId)
						?.pseudo ?? null

				// Pseudo YOU gave to your partner:
				this.partnerPseudo =
					pseudos.find((p) => p.owner_id === this.partnerId && p.partner_id === this.userId)
						?.pseudo ?? null
			}

			this.ready = true
		},

		async updatePartnerPseudo(newPseudo: string) {
			if (!this.userId || !this.partnerId) return

			const supabase = useSupabaseClient<Database>()

			const { data, error } = await supabase
				.from('partner_pseudos')
				.upsert(
					{
						owner_id: this.partnerId,
						partner_id: this.userId,
						pseudo: newPseudo,
					},
					{ onConflict: 'owner_id,partner_id' }
				)

				.select('*')

			if (!error && data && data.length > 0) {
				// Only update the string value
				this.partnerPseudo = data[0].pseudo
			}
		},
	},
})
