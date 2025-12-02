import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import webpush from 'web-push'
import type { Database } from '~/types/supabase.types'

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()
	const client = await serverSupabaseClient<Database>(event)

	const body = await readBody(event)

	const title = body.title || 'Notification'
	const message = body.body || ''

	// get current user
	const user = await serverSupabaseUser(event)
	const currentUserId = user?.sub

	if (!currentUserId) {
		throw createError({
			statusCode: 401,
			statusMessage: 'User not authenticated',
		})
	}

	// Configure web-push
	webpush.setVapidDetails(
		'mailto:test@example.com',
		config.public.publicVapid,
		config.private.privateVapid
	)

	// Fetch subscriptions for *everyone except me*
	const { data: subs, error } = await client
		.from('push_subscriptions')
		.select('*')
		.neq('user_id', currentUserId)

	if (error) {
		console.error('Error loading subscriptions:', error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Could not load subscriptions',
		})
	}

	// Make sure subs is always an array
	const subscriptions = subs ?? []

	// Send notifications
	const results = await Promise.all(
		subscriptions.map(async (sub: any) => {
			try {
				await webpush.sendNotification(
					{
						endpoint: sub.endpoint,
						keys: {
							p256dh: sub.p256dh,
							auth: sub.auth,
						},
					},
					JSON.stringify({ title, body: message })
				)

				return { endpoint: sub.endpoint, success: true }
			} catch (e) {
				console.error('Push error:', e)
				return { endpoint: sub.endpoint, success: false }
			}
		})
	)

	return { results }
})
