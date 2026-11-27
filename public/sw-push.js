// Push notification handler for Workbox-generated service worker
// This file will be imported by the generated service worker

self.addEventListener('push', function (event) {
	console.log('Push notification received', event)

	let data = {}
	try {
		if (event.data) {
			data = event.data.json()
		}
	} catch (e) {
		console.error('Error parsing push notification data:', e)
	}

	const title = data.title || 'Ugovor'
	const options = {
		body: data.body || 'You have a new notification',
		icon: '/icons/icon-192x192.png',
		badge: '/icons/icon-96x96.png',
		vibrate: [200, 100, 200],
		tag: data.shopItemId ? `shop-${data.shopAction}-${data.shopItemId}` : data.shopProposalId ? `shop-${data.shopProposalId}` : data.contractId ? `contract-${data.contractId}` : data.rewardId ? `reward-${data.rewardId}` : data.violationId ? `violation-${data.violationId}` : data.tag || 'ugovor-notification',
		data: data,
		requireInteraction: false,
		actions: data.actions || []
	}

	event.waitUntil(
		self.registration.showNotification(title, options)
	)
})

self.addEventListener('notificationclick', function (event) {
	console.log('Notification clicked', event)

	event.notification.close()

	const { rewardId, violationId, contractId, shopProposalId, shopItemId } = event.notification.data || {}
	const shopId = shopItemId || shopProposalId
	const activityId = shopId || contractId || rewardId || violationId
	const activityKind = contractId ? 'contract' : rewardId ? 'reward' : 'violation'
	// Ugovor uses hash routing. This same URL works for an open app or a cold start.
	const activityUrl = activityId
		? new URL(
			shopId
				? `#/shop?item=${encodeURIComponent(shopId)}`
				: `#/?${activityKind}=${encodeURIComponent(activityId)}`,
			self.registration.scope,
		).href
		: null
	const urlToOpen = activityUrl || event.notification.data?.url || '/'

	event.waitUntil(
		self.clients.matchAll({
			type: 'window',
			includeUncontrolled: true
		}).then(async function (clientList) {
			// Check if there's already a window open
			for (let i = 0; i < clientList.length; i++) {
				const client = clientList[i]
				if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
					if (activityUrl) {
						const opened = await client.navigate(activityUrl).catch(() => null)
						if (opened) return opened.focus()
						break
					}
					return client.focus().then(() => {
						// Send message to client about notification click
						client.postMessage({
							type: 'NOTIFICATION_CLICK',
							data: event.notification.data
						})
					})
				}
			}

			// If no window is open, open a new one
			if (self.clients.openWindow) {
				return self.clients.openWindow(urlToOpen)
			}
		})
	)
})

console.log('Push notification handlers registered')
