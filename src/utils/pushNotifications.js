/**
 * Corssira Web Push Notifications Utility
 * Handles SW registration + push subscription lifecycle
 */

import api from '../api/axios';

// Convert VAPID base64 public key to Uint8Array (required by browser API)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Register the service worker and subscribe the user to Web Push.
 * Call this after the user logs in.
 */
export async function registerPushNotifications() {
  try {
    // 1. Check browser support
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('⚠️ Web Push not supported in this browser');
      return false;
    }

    // 2. Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    // Wait until SW is active
    await navigator.serviceWorker.ready;

    // 3. Check current permission state
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('🔕 Push notification permission denied');
      return false;
    }

    // 4. Get VAPID public key from backend
    const { data } = await api.get('/push/vapid-public-key');
    const applicationServerKey = urlBase64ToUint8Array(data.publicKey);

    // 5. Subscribe (or reuse existing subscription)
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    // 6. Send subscription to backend
    await api.post('/push/subscribe', subscription.toJSON());

    console.log('✅ Push notifications registered successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to register push notifications:', error);
    return false;
  }
}

/**
 * Unsubscribe from push notifications.
 * Call this on logout.
 */
export async function unregisterPushNotifications() {
  try {
    if (!('serviceWorker' in navigator)) return;

    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!registration) return;

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('✅ Push notifications unsubscribed');
    }
  } catch (error) {
    console.error('❌ Failed to unsubscribe push notifications:', error);
  }
}

/**
 * Listen for navigation messages from the service worker
 * (when user clicks a notification while app is open)
 */
export function listenForServiceWorkerMessages(navigate) {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'NAVIGATE' && event.data?.url) {
      navigate(event.data.url);
    }
  });
}
