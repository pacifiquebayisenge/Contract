/**
 * POST /api/save-subscription
 *
 * Persists a browser push subscription so the server can send Web Push
 * notifications to this device later.
 *
 * Expected body (the PushSubscription.toJSON() output from the browser):
 * {
 *   endpoint: string,          // unique per device + browser + VAPID key
 *   expirationTime?: string,
 *   keys: { p256dh: string, auth: string }  // encryption keys for the push payload
 * }
 *
 * Behaviour:
 * - Requires an authenticated user (the subscription is linked to user_id).
 * - Upserts on `endpoint`: re-subscribing from the same device updates the
 *   existing row instead of creating a duplicate. This relies on the
 *   UNIQUE constraint on push_subscriptions.endpoint — without it, the
 *   upsert would fail with a Postgres 42P10 error.
 */

import {
	serverSupabaseClient,
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from '#supabase/server'
import type { Database } from '~/types/supabase.types'

export default defineEventHandler(async (event) => {
	// user id lives on `sub`, not `id`.
	const user = await serverSupabaseUser(event)
	const userId = user?.sub

	if (!userId) {
		throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
	}

	const body = await readBody(event)

	// A subscription without endpoint or keys can never receive a push,
	// so refuse to store incomplete objects.
	if (!body?.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
		throw createError({ statusCode: 400, statusMessage: 'Invalid subscription object' })
	}

	// Service role client: bypasses RLS. The table has RLS enabled with no
	// policies, so it is only writable through server routes like this one.
	// Auth is enforced above via serverSupabaseUser instead of via RLS.
	const client = serverSupabaseServiceRole<Database>(event)

	const { error } = await client.from('push_subscriptions').upsert(
		{
			user_id: userId,
			endpoint: body.endpoint,
			expiration_time: body.expirationTime,
			p256dh: body.keys.p256dh,
			auth: body.keys.auth,
		},
		// Same endpoint = same device subscription → update instead of insert.
		{ onConflict: 'endpoint' }
	)

	if (error) {
		console.error('[save-subscription] upsert failed:', error)
		throw createError({ statusCode: 500, statusMessage: 'Failed to save subscription' })
	}

	return { success: true }
})
