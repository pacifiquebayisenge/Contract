import type { Database } from '~/types/supabase.types'

type Event = Database['public']['Tables']['user_events']['Row']

export const useEventStore = defineStore('event', () => {
	// State
	const events = ref<Event[]>([])
	const loading = ref(false)
	const error = ref<any>(null)

	// Actions
	async function fetchEvents() {
		loading.value = true

		try {
			const supabase = useSupabaseClient<Database>()

			const { data, error: fetchError } = await supabase
				.from('user_events')
				.select('*')
				.order('created_at', { ascending: false })
				.limit(20)

			if (fetchError) throw fetchError

			events.value = data as Event[]
		} catch (e) {
			error.value = e
		} finally {
			loading.value = false
		}
	}

	async function getEventProfile(event: Event) {
		const supabase = useSupabaseClient<Database>()

		const { data, error: fetchError } = await supabase
			.from('profiles')
			.select('id, firstname, lastname')
			.eq('id', event.actor_id)
			.single()

		if (fetchError) throw fetchError
		return data
	}

	return {
		events,
		loading,
		error,
		fetchEvents,
		getEventProfile,
	}
})
