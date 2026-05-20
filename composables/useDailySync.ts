export function useNewDaySync() {
	const streakStore = useStreakStore()
	const creditStore = useCreditStore()

	const DAY = 1000 * 60 * 60 * 24

	const daysPassed = (key: string): number | null => {
		const lastStr = localStorage.getItem(key)
		if (!lastStr) return null // First time user

		const last = new Date(lastStr)
		const today = new Date()

		// removes the time part from both dates
		// only the day part, not  hour/minutes/seconds.
		today.setHours(0, 0, 0, 0)
		last.setHours(0, 0, 0, 0)

		return Math.floor((today.getTime() - last.getTime()) / DAY)
	}

	const isNewDay = () => daysPassed('last-sync-day') !== 0

	const handleNewDay = async () => {
		const passed = daysPassed('last-sync-day')

		// First time user - just set today's date and return
		if (passed === null) {
			localStorage.setItem('last-sync-day', new Date().toISOString())
			return
		}

		if (passed === 0) return // Already synced today

		// Save timestamp FIRST to prevent double execution
		localStorage.setItem('last-sync-day', new Date().toISOString())

		// Apply credit and reset streak
		await creditStore.updateCredit(passed * 100)
		await streakStore.resetPartnerStreak()
	}

	return {
		handleNewDay,
		isNewDay,
	}
}
