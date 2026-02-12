export function useEventsHistory() {
	const eventStore = useEventStore()
	const userStore = useUserStore()
	let events = []

	const getAllEvents = computed(() => {
		events = eventStore.events.map((event) => {
			const actor = userStore.getProfileById(event.actor_id)
			const target = userStore.getProfileById(event.target_id)
			return { ...event, actor: actor, target: target }
		})

		return events
	})

	return {
		getAllEvents,
	}
}
