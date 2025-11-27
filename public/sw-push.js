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
		tag: data.tag || 'ugovor-notification',
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

	const urlToOpen = event.notification.data?.url || '/'

	event.waitUntil(
		self.clients.matchAll({
			type: 'window',
			includeUncontrolled: true
		}).then(function (clientList) {
			// Check if there's already a window open
			for (let i = 0; i < clientList.length; i++) {
				const client = clientList[i]
				if (client.url.includes(self.registration.scope) && 'focus' in client) {
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