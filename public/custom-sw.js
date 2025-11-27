self.addEventListener('push', (event) => {
	let data = {}
	try { data = event.data.json() } catch (e) { }

	const title = data.title || 'New Notification'
	event.waitUntil(
		self.registration.showNotification(title, {
			body: data.body,
			icon: '/icons/icon-192x192.png',
			badge: '/icons/icon-96x96.png',
			data
		})
	)
})
