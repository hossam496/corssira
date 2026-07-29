import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// ── Precache all assets built by vite-plugin-pwa ──────────────────────────────
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// ── Install: activate immediately without waiting ─────────────────────────────
self.addEventListener('install', () => {
  self.skipWaiting();
});

// ── Activate: take control of all open tabs immediately ───────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ── Push: fires even when app is closed / phone is locked ─────────────────────
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'كورسيرا 📚', message: event.data.text() };
    }
  }

  const title = data.title || 'كورسيرا 📚';
  const options = {
    body: data.message || 'لديك إشعار جديد',
    icon: '/logo.png',
    badge: '/logo.png',
    dir: 'rtl',
    lang: 'ar',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'corssira-notification',
    renotify: true,
    requireInteraction: false,
    data: { url: data.url || '/chat' },
    actions: [
      { action: 'open',    title: 'فتح الشات' },
      { action: 'dismiss', title: 'تجاهل' },
    ],
  };

  // event.waitUntil keeps the SW alive until the notification is shown
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ── Notification click: open or focus the app ─────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = new URL(
    (event.notification.data && event.notification.data.url) || '/chat',
    self.location.origin
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app already open — focus it and navigate
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            client.postMessage({ type: 'NAVIGATE', url: targetUrl });
            return;
          }
        }
        // App is closed — open new window
        return self.clients.openWindow(targetUrl);
      })
  );
});

// ── Push subscription change: auto-renew and re-save to server ────────────────
// This fires when the browser rotates the push subscription keys.
// Without this the user would stop receiving notifications silently.
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const appServerKey = event.oldSubscription
          ? event.oldSubscription.options.applicationServerKey
          : null;

        const newSubscription = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: appServerKey,
        });

        // Get auth token from IndexedDB-backed storage via clients
        // We send to all open clients so they can relay to the API with a valid token
        const clientList = await self.clients.matchAll({ includeUncontrolled: true });
        if (clientList.length > 0) {
          clientList[0].postMessage({
            type: 'PUSH_SUBSCRIPTION_CHANGED',
            subscription: newSubscription.toJSON(),
          });
        } else {
          // No open tabs — save directly using fetch (no auth, best-effort)
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSubscription.toJSON()),
          });
        }
      } catch (err) {
        console.error('[SW] pushsubscriptionchange failed:', err);
      }
    })()
  );
});
