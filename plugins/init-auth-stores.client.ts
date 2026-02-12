export default defineNuxtPlugin(() => {
	const authUser = useSupabaseUser()

	const userStore = useUserStore()
	const pseudoStore = usePseudoStore()

	const seenStore = useSeenStore()
	const streakStore = useStreakStore()
	const creditStore = useCreditStore()

	const eventStore = useEventStore()

	const { handleNewDay } = useNewDaySync()

	const initialized = ref(false)

	watch(
		authUser,
		async (u) => {
			if (!u?.sub || initialized.value) return
			initialized.value = true

			// init stores safely
			if (!userStore.ready) await userStore.init()
			if (!pseudoStore.ready) await pseudoStore.init()

			seenStore.init()
			streakStore.init()
			creditStore.init()

			await seenStore.updateSeen()

			await handleNewDay()

			await eventStore.fetchEvents()
		},
		{ immediate: true }
	)
})
