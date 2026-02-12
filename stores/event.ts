// stores/event.ts
import { defineStore } from 'pinia'
import type { Database } from '~/types/supabase.types'

type Event = Database['public']['Tables']['user_events']['Row']

export const useEventStore = defineStore('event', {
	state: () => ({
		events: [] as Event[],
		loading: false,
		error: null as any,
	}),

	actions: {
		async fetchEvents() {
			this.loading = true

			try {
				const supabase = useSupabaseClient<Database>()

				const { data, error } = await supabase
					.from('user_events')
					.select('*')
					.order('created_at', { ascending: false })
					.limit(20)

				if (error) throw error

				this.events = data as Event[]
			} catch (error) {
				this.error = error
			} finally {
				this.loading = false
			}
		},

		async getEventProfile(event: Event) {
			const supabase = useSupabaseClient<Database>()

			const { data, error } = await supabase
				.from('profiles')
				.select('id, firstname, lastname')
				.eq('id', event.actor_id)
				.single()

			if (error) throw error
			return data
		},
	},
})
