self.addEventListener('push', (event) => {
	let data = {}

	try {
		data = event.data.json()
	} catch (e) {
		console.error('Push event data error:', e)
	}

	const title = data.title || 'New Notification'
	const options = {
		body: data.body || '',
		icon: '/icons/icon-192x192.png',
		badge: '/icons/icon-96x96.png',
		data: data,
	}

	event.waitUntil(self.registration.showNotification(title, options))
})
