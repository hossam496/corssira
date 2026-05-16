import api from '../api/axios';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const subscribeToWebPush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported by the browser.');
    return null;
  }

  // Use Env key with hardcoded fallback
  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BOc1khzvd_ZD5uoAW3cxL_BPRq0AYu0Git8nNwV9ud4nCR13XwAxH7q0qxqoGLM6bCRpVAKCEMuP1X2wehU1jEA';

  try {
    const registration = await navigator.serviceWorker.ready;
    console.log('Service Worker is ready. State:', registration.active ? 'active' : 'waiting/installing');

    let subscription = await registration.pushManager.getSubscription();
    const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

    if (!subscription) {
      console.log('Subscribing to push service...');
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        });
      } catch (subError) {
        if (subError.name === 'AbortError') {
          console.error('❌ Push Service Error (AbortError):', subError.message);
          console.warn('This usually happens when the browser cannot connect to Google/Mozilla push servers.');
          console.warn('Check if you are behind a VPN, Firewall, or if Windows Notifications are disabled.');
          
          // Attempt recovery: Clear existing and try once more
          const existing = await registration.pushManager.getSubscription();
          if (existing) await existing.unsubscribe();
          
          await new Promise(r => setTimeout(r, 1000));
          
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey
          });
        } else {
          throw subError;
        }
      }
    }

    if (subscription) {
      await api.post('/push/subscribe', subscription);
      console.log('✅ Push subscription active');
      return subscription;
    }
    return null;
  } catch (error) {
    console.error('Push Error:', error.name, '-', error.message);
    if (error.name === 'AbortError') {
      console.error('💡 TIP: If you are on Windows, make sure "Focus Assist" is OFF and browser notifications are ON in System Settings.');
    }
    return null;
  }
};
