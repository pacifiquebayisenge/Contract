import { ref } from 'vue'
import { navigateTo } from '#app'
import { useSupabaseClient, useSupabaseUser } from '#imports'

export function useAuth() {
	const supabase = useSupabaseClient()
	const user = useSupabaseUser()

	const loading = ref(false)
	const errorMessage = ref<string | null>(null)

	// --- LOGIN ---
	async function login(email: string, password: string) {
		loading.value = true
		errorMessage.value = null

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		loading.value = false

		if (error) {
			errorMessage.value = error.message
			return false
		}

		return true
	}

	// --- SIGNUP ---
	async function signup(email: string, password: string) {
		loading.value = true
		errorMessage.value = null

		const { error } = await supabase.auth.signUp({
			email,
			password,
		})

		loading.value = false

		if (error) {
			errorMessage.value = error.message
			return false
		}

		return true
	}

	// --- LOGOUT ---
	async function logout() {
		await supabase.auth.signOut()
		navigateTo('/signin')
	}

	return {
		user,
		loading,
		errorMessage,
		login,
		signup,
		logout,
	}
}
