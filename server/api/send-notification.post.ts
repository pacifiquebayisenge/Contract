/**
 * POST /api/send-notification
 *
 * Sends a Web Push notification to every subscribed device EXCEPT the
 * sender's own devices (you don't want a notification for your own action).
 *
 * Expected body:
 * {
 *   title?: string,  // defaults to 'Notification'
 *   body?: string,   // defaults to ''
 *   violationId?: string, // sends a saved violation to its recipient only
 *   rewardId?: string // sends a saved reward to its recipient only
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
	const client = serverSupabaseServiceRole<Database>(event)

	let notification: { title: string; body: string; violationId?: string; rewardId?: string } = {
		title: body.title || 'Notification',
		body: body.body || '',
	}
	let subscriptions = client.from('push_subscriptions').select('*')

	if (body.violationId !== undefined) {
		if (typeof body.violationId !== 'string' || !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(body.violationId)) {
			throw createError({ statusCode: 400, statusMessage: 'Invalid violation ID' })
		}

		// Resolve the recipient and message from the saved record, never from the request.
		const { data: violation, error } = await client
			.from('user_events')
			.select('id, target_id, rule_title')
			.eq('id', body.violationId)
			.eq('actor_id', currentUserId)
			.eq('event_type', 'violation')
			.maybeSingle()

		if (error) throw createError({ statusCode: 500, statusMessage: 'Could not load violation' })
		if (!violation) throw createError({ statusCode: 404, statusMessage: 'Violation not found' })

		notification = {
			title: 'Shameful !! 😡',
			body: violation.rule_title ? `You violated: ${violation.rule_title}` : 'You violated a contract rule.',
			violationId: violation.id,
		}
		subscriptions = subscriptions.eq('user_id', violation.target_id)
	} else if (body.rewardId !== undefined) {
		if (typeof body.rewardId !== 'string' || !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(body.rewardId)) {
			throw createError({ statusCode: 400, statusMessage: 'Invalid reward ID' })
		}

		const { data: reward, error } = await client
			.from('credit_increases')
			.select('id, receiver_id, description')
			.eq('id', body.rewardId)
			.eq('giver_id', currentUserId)
			.maybeSingle()

		if (error) throw createError({ statusCode: 500, statusMessage: 'Could not load reward' })
		if (!reward) throw createError({ statusCode: 404, statusMessage: 'Reward not found' })

		notification = {
			title: "you've earned a reward 🥳",
			body: reward.description || 'You received a reward.',
			rewardId: reward.id,
		}
		subscriptions = subscriptions.eq('user_id', reward.receiver_id)
	} else {
		subscriptions = subscriptions.neq('user_id', currentUserId)
	}

	const payload = JSON.stringify(notification)

	// VAPID identifies our server to the push services (Apple, FCM, Mozilla).
	// Keys come from runtimeConfig (NUXT_PRIVATE_VAPID / NUXT_PUBLIC_VAPID).
	webpush.setVapidDetails('mailto:you@example.com', config.public.publicVapid, config.privateVapid)

	const { data: subs, error } = await subscriptions

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
