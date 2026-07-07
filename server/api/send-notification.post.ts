/**
 * POST /api/send-notification
 *
 * Sends a Web Push notification to every subscribed device EXCEPT the
 * sender's own devices (you don't want a notification for your own action).
 *
 * Expected body:
 * {
 *   title?: string,  // defaults to 'Notification'
 *   body?: string    // defaults to ''
 * }
 *
 * Behaviour:
 * - Requires an authenticated user (used to exclude their own devices).
 * - Signs each push with our VAPID key pair. If the VAPID keys ever change,
 *   every existing subscription becomes invalid (typically a 403 from the
 *   push service) and all devices must re-subscribe.
 * - Self-cleaning: push services answer 404/410 for expired or revoked
 *   subscriptions; those rows are deleted so the table doesn't accumulate
 *   dead endpoints.
 *
 * Returns: { results: [{ endpoint, success, status? }] }
 * The `status` field on failures is the HTTP code from the push service —
 * 404/410 = expired subscription (cleaned up), 403 = VAPID key mismatch.
 */

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import webpush from 'web-push'
import type { Database } from '~/types/supabase.types'

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()

	// user id is on `sub`
	const user = await serverSupabaseUser(event)
	const currentUserId = user?.sub

	if (!currentUserId) {
		throw createError({ statusCode: 401, statusMessage: 'User not authenticated' })
	}

	const body = await readBody(event)

	// This payload is what the service worker (sw-push.js) receives in its
	// 'push' event and turns into a visible notification.
	const payload = JSON.stringify({
		title: body.title || 'Notification',
		body: body.body || '',
	})

	// VAPID identifies our server to the push services (Apple, FCM, Mozilla).
	// Keys come from runtimeConfig (NUXT_PRIVATE_VAPID / NUXT_PUBLIC_VAPID).
	webpush.setVapidDetails('mailto:you@example.com', config.public.publicVapid, config.privateVapid)

	// Service role client: we need to read OTHER users' subscriptions,
	// which RLS would block for a user-scoped client.
	const client = serverSupabaseServiceRole<Database>(event)

	// All devices except the sender's. user_id is NOT NULL, so a plain
	// .neq() is safe here (NULL rows, which .neq() would silently skip
	// due to SQL null semantics, cannot exist).
	const { data: subs, error } = await client
		.from('push_subscriptions')
		.select('*')
		.neq('user_id', currentUserId)

	if (error) {
		console.error('[send-notification] failed to load subscriptions:', error)
		throw createError({ statusCode: 500, statusMessage: 'Could not load subscriptions' })
	}

	// Send in parallel; one failing endpoint must not block the others.
	const results = await Promise.all(
		(subs ?? []).map(async (sub) => {
			try {
				await webpush.sendNotification(
					// Rebuild the shape the Web Push protocol expects from our flat columns.
					{ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
					payload
				)
				return { endpoint: sub.endpoint, success: true }
			} catch (e: any) {
				const status = e?.statusCode

				// 404/410 = the push service says this subscription no longer
				// exists (app uninstalled, permission revoked, expired).
				// Delete it so we stop trying.
				if (status === 404 || status === 410) {
					await client.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
				}

				console.error('[send-notification] push failed:', status, sub.endpoint)
				return { endpoint: sub.endpoint, success: false, status }
			}
		})
	)

	return { results }
})
