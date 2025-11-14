// Custom Service Worker for NFC Ping Notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(self.clients.claim());
});

// Listen for navigation events to /ping/* URLs
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Check if this is a ping URL with NFC source
  if (url.pathname.startsWith('/ping/') && url.searchParams.get('source') === 'nfc') {
    // Show notification when NFC ring is tapped
    event.waitUntil(
      self.registration.showNotification('You just got pinged! 🎉', {
        body: 'Someone tapped your ring to view your profile',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'nfc-ping',
        requireInteraction: false,
        vibrate: [200, 100, 200],
        data: {
          url: event.request.url
        }
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Open the app at the appropriate URL
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (let client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(event.notification.data.url);
      }
    })
  );
});
