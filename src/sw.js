import { precacheAndRoute } from 'workbox-precaching';

// 1. Precache assets for PWA
precacheAndRoute(self.__WB_MANIFEST || []);

// 2. Install Event: Force immediate activation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 3. Activate Event: Claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 4. Push Event: Handle incoming notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.message || 'لديك إشعار جديد',
      icon: '/logo.png',
      badge: '/logo.png',
      dir: 'rtl',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
      requireInteraction: true
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'تنبيه', options)
    );
  } catch (err) {
    console.error('Push event error:', err);
  }
});

// 5. Notification Click Event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
