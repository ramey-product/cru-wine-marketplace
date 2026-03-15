// Service Worker for Cru push notifications
// Handles push events and notification click routing

self.addEventListener('push', function (event) {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = {
      title: 'Cru',
      body: event.data.text(),
    }
  }

  const { title, body, icon, badge, data, tag } = payload

  const options = {
    body: body || '',
    icon: icon || '/icons/icon-192x192.png',
    badge: badge || '/icons/badge-72x72.png',
    // Tag-based dedup: same tag replaces previous notification
    tag: tag || 'cru-notification',
    data: data || {},
    // Vibrate pattern for mobile
    vibrate: [100, 50, 100],
    // Keep notification until user interacts
    requireInteraction: false,
  }

  event.waitUntil(self.registration.showNotification(title || 'Cru', options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const data = event.notification.data || {}
  // Default to orders page, but use deep link if provided
  const url = data.url || '/orders'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        // If a window is already open, focus and navigate
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus()
            client.navigate(url)
            return
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})
