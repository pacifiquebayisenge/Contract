import type { Database } from '~/types/supabase.types'
import { useUserStore } from './user'

// only can manage partner streak
//TODO: CLEAN UP
export const useStreakStore = defineStore('streak', {
  state: () => ({
    value: 0,
  }),

  getters: {
    getStreakCount: (s) => s.value,
  },

  actions: {
    setStreak(n: number) {
      this.value = n
    },

    async updateStreak() {
      const supabase = useSupabaseClient<Database>()
      const userStore = useUserStore()

      const partner = userStore.partnerProfile

      if (!partner) {
        console.error('partnerProfile is not loaded, cannot update streak.')
        return
      }

      const newStreak = this.value + 1
      this.setStreak(newStreak)

      const { data, error } = await supabase
        .from('profiles')
        .update({
          streak: newStreak,
        })
        // partner !! only when partner uses his streak
        .eq('id', partner.id)
        .select('*')

      if (error) {
        console.error('Failed to update streak:', error)
        return
      }

      if (data && data.length > 0) {
        console.log('Streak updated:', `${data[0].firstname}: streak ${data[0].streak}`)
        userStore.partnerProfile!.streak = this.value
      }

      await $fetch('/api/send-notification', {
        method: 'POST',
        body: {
          title: 'Unbelievable !!',
          body: ` You used Contract again 😒`,
        },
      })
    },

    async resetStreak() {
      const supabase = useSupabaseClient<Database>()
      const userStore = useUserStore()

      const partner = userStore.partnerProfile

      if (!partner) {
        console.error('partnerProfile is not loaded, cannot update streak.')
        return
      }
      const newStreak = 0
      this.setStreak(newStreak)

      const { data, error } = await supabase
        .from('profiles')
        .update({
          streak: newStreak,
        })
        .eq('id', partner.id)
        .select('*')

      if (error) {
        console.error('Failed to reset streak:', error)
        return
      }

      if (data && data.length > 0) {
        console.log('Streak reset:', `${data[0].firstname}: streak ${data[0].streak}`)
        userStore.partnerProfile!.streak = this.value
      }
    },

    init() {
      const userStore = useUserStore()
      // partner !! only when partner uses his streak
      const partner = userStore.partnerProfile
      const streak = partner?.streak ?? 0
      this.setStreak(streak)
    },
  },
})
