import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase.types'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient<Database>(event)
	const body = await readBody(event)

	if (!body?.endpoint) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Missing subscription endpoint',
		})
	}

	const { error } = await client.from('push_subscriptions').delete().eq('endpoint', body.endpoint)

	if (error) {
		console.error('Delete subscription error:', error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to remove subscription',
		})
	}

	return { success: true }
})
