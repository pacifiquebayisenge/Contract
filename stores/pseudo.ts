import type { Database } from '~/types/supabase.types'

export const usePseudoStore = defineStore('pseudo', () => {
	// State
	const userId = ref<string | null>(null)
	const partnerId = ref<string | null>(null)
	const myPseudo = ref<string | null>(null)
	const partnerPseudo = ref<string | null>(null)
	const ready = ref(false)

	// Actions
	async function init() {
		const supabase = useSupabaseClient<Database>()
		const authUser = useSupabaseUser()

		if (!authUser.value) return
		userId.value = authUser.value.sub

		const { data: profiles } = await supabase.from('profiles').select('id')

		if (!profiles) return

		partnerId.value = profiles.find((p) => p.id !== userId.value)?.id ?? null

		const { data: pseudos } = await supabase.from('partner_pseudos').select('*')

		if (pseudos) {
			myPseudo.value =
				pseudos.find((p) => p.owner_id === userId.value && p.partner_id === partnerId.value)
					?.pseudo ?? null

			partnerPseudo.value =
				pseudos.find((p) => p.owner_id === partnerId.value && p.partner_id === userId.value)
					?.pseudo ?? null
		}

		ready.value = true
	}

	async function updatePartnerPseudo(newPseudo: string) {
		if (!userId.value || !partnerId.value) return

		const supabase = useSupabaseClient<Database>()

		const { data, error } = await supabase
			.from('partner_pseudos')
			.upsert(
				{
					owner_id: partnerId.value,
					partner_id: userId.value,
					pseudo: newPseudo,
				},
				{ onConflict: 'owner_id,partner_id' }
			)
			.select('*')

		if (!error && data && data.length > 0) {
			partnerPseudo.value = data[0]!.pseudo
		}
	}

	return {
		userId,
		partnerId,
		myPseudo,
		partnerPseudo,
		ready,
		init,
		updatePartnerPseudo,
	}
})
