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
		tag: data.violationId ? `violation-${data.violationId}` : data.tag || 'ugovor-notification',
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

	const violationId = event.notification.data?.violationId
	// Ugovor uses hash routing. This same URL works for an open app or a cold start.
	const violationUrl = violationId
		? new URL(`#/?violation=${encodeURIComponent(violationId)}`, self.registration.scope).href
		: null
	const urlToOpen = violationUrl || event.notification.data?.url || '/'

	event.waitUntil(
		self.clients.matchAll({
			type: 'window',
			includeUncontrolled: true
		}).then(async function (clientList) {
			// Check if there's already a window open
			for (let i = 0; i < clientList.length; i++) {
				const client = clientList[i]
				if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
					if (violationUrl) {
						const opened = await client.navigate(violationUrl).catch(() => null)
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
