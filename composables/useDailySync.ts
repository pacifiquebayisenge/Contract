export function useNewDaySync() {
  const streakStore = useStreakStore()
  const creditStore = useCreditStore()

  const DAY = 1000 * 60 * 60 * 24

  const daysPassed = (key: string) => {
    const lastStr = localStorage.getItem(key)
    if (!lastStr) return 0

    const last = new Date(lastStr)
    const today = new Date()

    today.setHours(0, 0, 0, 0)
    last.setHours(0, 0, 0, 0)

    return Math.floor((today.getTime() - last.getTime()) / DAY)
  }

  const isNewDay = () => daysPassed('last-sync-day') > 0

  const handleNewDay = async () => {
    if (!isNewDay()) return

    // 1. Apply credit
    const passed = daysPassed('last-sync-day')
    if (passed > 0) {
      await creditStore.updateCredit(passed * 100)

      await streakStore.resetStreak()
    }

    // 3. Save sync timestamp
    localStorage.setItem('last-sync-day', new Date().toISOString())
  }

  return {
    handleNewDay,
    isNewDay,
  }
}
