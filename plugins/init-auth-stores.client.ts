let initialized = false

export default defineNuxtPlugin(() => {
  const authUser = useSupabaseUser()

  const userStore = useUserStore()
  const pseudoStore = usePseudoStore()

  const seenStore = useSeenStore()
  const streakStore = useStreakStore()
  const creditStore = useCreditStore()

  const { handleNewDay } = useNewDaySync()

  watch(
    authUser,
    async (u) => {
      if (!u || !u.sub) return

      if (initialized) return
      initialized = true

      // init stores safely
      if (!userStore.ready) await userStore.init()
      if (!pseudoStore.ready) await pseudoStore.init()

      seenStore.init()
      streakStore.init()
      creditStore.init()

      console.log('👁 updating seen…')
      await seenStore.updateSeen()

      console.log('📅 running daily logic…')
      await handleNewDay()
    },
    { immediate: true }
  )
})
