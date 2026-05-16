import api from '../api/axios';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
  return outputArray;
};

export const subscribeToWebPush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push API is not supported in this browser.');
    return null;
  }

  if (Notification.permission === 'denied') {
    console.warn('User has denied push notifications.');
    return null;
  }

  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BBUDz8BODb4QJl-w_69LqP-lYtSlLsGZNREiV21MSK8SYBYekqePZ9BMQmfCFCqRA6FPJ2ptiMUWfQSX4D-YDIE';
  if (!VAPID_PUBLIC_KEY) throw new Error('VAPID Public Key is missing!');

  try {
    const registration = await navigator.serviceWorker.ready;
    const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      try {
        const isExpired = subscription.expirationTime && Date.now() > subscription.expirationTime;
        if (isExpired) {
          await subscription.unsubscribe();
          subscription = null;
        }
      } catch (e) {
        await subscription.unsubscribe();
        subscription = null;
      }
    }

    if (!subscription) {
      console.log('Creating new push subscription...');
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        });
      } catch (subError) {
        if (subError.name === 'AbortError') {
          console.warn('AbortError encountered. Attempting aggressive reset...');
          
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) { await reg.unregister(); }
          
          const newReg = await navigator.serviceWorker.register('/sw.js');
          await navigator.serviceWorker.ready;
          
          await new Promise(res => setTimeout(res, 2000));
          
          subscription = await newReg.pushManager.subscribe({
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
      console.log('✅ Successfully subscribed to Web Push');
      return subscription;
    }
  } catch (error) {
    console.error('Final Push Registration Failed:', error.name, error.message);
    if (error.name === 'AbortError') {
      console.error('🚨 TIP: This is a browser/OS block. Turn off Windows Focus Assist, check your VPN/Firewall, and try clearing the site data.');
    }
    return null;
  }
};
