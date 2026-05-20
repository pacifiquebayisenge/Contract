import type { Database } from '~/types/supabase.types'
import { useUserStore } from './user'

export const useSeenStore = defineStore('seen', () => {
	// State
	const value = ref(0)

	// Actions
	function setSeen(n: number) {
		value.value = n
	}

	async function updateSeen() {
		const userStore = useUserStore()
		const supabase = useSupabaseClient<Database>()

		const profile = userStore.profile

		if (!profile) {
			console.error('❌ Profile not loaded')
			return
		}

		const newSeen = value.value + 1
		setSeen(newSeen)

		const { data, error } = await supabase
			.from('profiles')
			.update({ seen: newSeen })
			.eq('id', profile.id)
			.select('*')

		if (error) {
			console.error('❌ Failed to update seen:', error)
			return
		}

		await logSeenUpdate()

		if (data && data.length > 0) {
			userStore.profile!.seen = value.value
		}
	}

	async function logSeenUpdate() {
		const supabase = useSupabaseClient<Database>()
		const userStore = useUserStore()

		if (!userStore.profile?.id) {
			console.error('❌ User profile is not loaded, cannot log app open.')
			return
		}

		const { error } = await supabase.from('user_events').insert({
			actor_id: userStore.profile!.id,
			target_id: userStore.profile!.id,
			event_type: 'app_open',
		})

		if (error) {
			console.error('❌ Failed to log app open event:', error)
		}
	}

	function init() {
		const userStore = useUserStore()
		setSeen(userStore.profile?.seen || 0)
	}

	return {
		value,
		setSeen,
		updateSeen,
		logSeenUpdate,
		init,
	}
})
