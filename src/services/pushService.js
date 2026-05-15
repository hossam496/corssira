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

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!publicVapidKey) {
      console.error('VAPID public key is missing from environment variables!');
      return null;
    }

    const convertedKey = urlBase64ToUint8Array(publicVapidKey.trim());

    // If subscription exists, verify it (optional, but let's just use it)
    if (subscription) {
      console.log('Existing push subscription found.');
    } else {
      console.log('No existing subscription. Subscribing now...');
      
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        });
      } catch (subError) {
        if (subError.name === 'AbortError') {
          console.warn('Push service aborted. Attempting to reset and retry...');
          // Try to clean up any ghost subscription
          const ghostSub = await registration.pushManager.getSubscription();
          if (ghostSub) await ghostSub.unsubscribe();
          
          // Retry once after a short delay
          await new Promise(resolve => setTimeout(resolve, 1000));
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
      // Send the subscription to the backend
      await api.post('/push/subscribe', subscription);
      console.log('✅ Push subscription synchronized with backend');
      return subscription;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to subscribe to web push:', error);
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    
    if (error.name === 'AbortError') {
      console.info('Tip: This often happens due to network issues or using 127.0.0.1 instead of localhost.');
    }
    
    return null;
  }
};
