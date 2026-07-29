import api from '../api/axios';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
  return outputArray;
};

/**
 * Wait for vite-plugin-pwa to register the service worker (it does it automatically).
 * We just wait until navigator.serviceWorker.ready resolves — no manual register() call.
 */
const waitForServiceWorker = () => {
  return new Promise((resolve, reject) => {
    if (!('serviceWorker' in navigator)) {
      reject(new Error('Service Worker not supported'));
      return;
    }
    // Timeout after 8 seconds
    const timeout = setTimeout(() => reject(new Error('SW ready timeout')), 8000);
    navigator.serviceWorker.ready.then((reg) => {
      clearTimeout(timeout);
      resolve(reg);
    }).catch(reject);
  });
};

export const subscribeToWebPush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('⚠️ Push API not supported in this browser');
    return null;
  }

  if (Notification.permission === 'denied') {
    console.warn('🔕 Push notifications denied by user');
    return null;
  }

  // Use key from .env — already hardcoded as fallback for safety
  let VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!VAPID_PUBLIC_KEY) {
    try {
      const { data } = await api.get('/push/vapid-public-key');
      VAPID_PUBLIC_KEY = data.publicKey;
    } catch (e) {
      console.error('❌ Failed to fetch VAPID key:', e.message);
      return null;
    }
  }

  try {
    // Wait for vite-plugin-pwa to activate the SW (never call register() manually)
    const registration = await waitForServiceWorker();
    const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription();
    const isExpired = subscription?.expirationTime && Date.now() > subscription.expirationTime;
    if (subscription && isExpired) {
      await subscription.unsubscribe();
      subscription = null;
    }

    // Create new subscription if none exists
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
    }

    // Send subscription to backend (axios interceptor adds auth token automatically)
    await api.post('/push/subscribe', subscription.toJSON());
    console.log('✅ Push subscription saved to server');
    return subscription;
  } catch (error) {
    console.error('❌ Push subscription failed:', error.name, error.message);
    return null;
  }
};
