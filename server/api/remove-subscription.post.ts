/**
 * POST /api/remove-subscription
 *
 * Deletes a stored push subscription, called when a device unsubscribes
 * (e.g. the user disables notifications in the app).
 *
 * Expected body: { endpoint: string }
 *
 * The endpoint alone identifies the row (it has a UNIQUE constraint) —
 * no auth check needed since endpoints are unguessable, capability-style
 * URLs that only the owning device knows.
 */

import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/supabase.types'

export default defineEventHandler(async (event) => {
	const body = await readBody(event)

	if (!body?.endpoint) {
		throw createError({ statusCode: 400, statusMessage: 'Missing subscription endpoint' })
	}

	// Service role client — RLS is enabled with no policies, so deletes
	// only happen through this server route.
	const client = serverSupabaseServiceRole<Database>(event)

	const { error } = await client.from('push_subscriptions').delete().eq('endpoint', body.endpoint)

	if (error) {
		console.error('[remove-subscription] delete failed:', error)
		throw createError({ statusCode: 500, statusMessage: 'Failed to remove subscription' })
	}

	return { success: true }
})
