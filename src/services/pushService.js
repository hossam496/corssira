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

  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BBUDz8BODb4QJl-w_69LqP-lYtSlLsGZNREiV21MSK8SYBYekqePZ9BMQmfCFCqRA6FPJ2ptiMUWfQSX4D-YDIE';

  try {
    // 1. Wait for SW to be ready
    let registration = await navigator.serviceWorker.ready;
    
    // 2. Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

    if (!subscription) {
      console.log('Attempting push subscription...');
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        });
      } catch (subError) {
        if (subError.name === 'AbortError') {
          console.error('❌ AbortError detected. Resetting service workers...');
          
          // CRITICAL FIX: Unregister all and reload if necessary
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.unregister();
          }
          
          // Re-register manually (optional, but safer)
          await navigator.serviceWorker.register('/sw.js');
          registration = await navigator.serviceWorker.ready;
          
          await new Promise(r => setTimeout(r, 1500));
          
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
    console.error('Push Final Error:', error.name, '-', error.message);
    if (error.name === 'AbortError') {
       console.error('💡 TIP: Close all browser tabs of this site, check Windows "Focus Assist", and try again.');
    }
    return null;
  }
};
