import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/supabase.types'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient<Database>(event)
	const body = await readBody(event)

	// ⭐ Correct function to get logged-in user on server
	const session = await serverSupabaseUser(event)
	const userId = session?.sub

	// Must contain endpoint, keys, etc.
	if (!body?.endpoint) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid subscription object',
		})
	}

	const { data, error } = await client.from('push_subscriptions').upsert(
		{
			user_id: userId,
			endpoint: body.endpoint,
			expiration_time: body.expirationTime,
			p256dh: body.keys?.p256dh,
			auth: body.keys?.auth,
		},
		{ onConflict: 'endpoint' } // avoid duplicates
	)

	if (error) {
		console.error('🔥 SUPABASE UPSERT ERROR:', error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to save subscription',
		})
	}

	return { success: true }
})
