import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

let permissionChecked = false;

/**
 * Kullanıcıdan iOS / Android yerel bildirim izni ister.
 */
export async function requestNotificationPermission() {
  if (!Capacitor.isNativePlatform()) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
      try {
        return await Notification.requestPermission();
      } catch {
        return 'denied';
      }
    }
    return 'granted';
  }

  try {
    const status = await LocalNotifications.checkPermissions();
    if (status.display !== 'granted') {
      const requested = await LocalNotifications.requestPermissions();
      permissionChecked = requested.display === 'granted';
      return requested.display;
    }
    permissionChecked = true;
    return status.display;
  } catch (err) {
    console.warn('[NativeNotifications] Permission error:', err);
    return 'denied';
  }
}

/**
 * Telefona yukarıdan açılan yerel iOS bildirim banner'ı fırlatır.
 */
export async function sendNativeNotification({ title, body, id, extra = {} }) {
  const notifId = id ? (typeof id === 'number' ? id : Math.abs(hashCode(String(id)))) : Math.floor(Math.random() * 1000000);

  if (Capacitor.isNativePlatform()) {
    try {
      if (!permissionChecked) {
        await requestNotificationPermission();
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title: title || 'SecureDrive VIP',
            body: body || 'Yeni bir görev veya bildiriminiz var.',
            sound: 'default',
            attachments: [],
            actionTypeId: '',
            extra: extra,
            schedule: { at: new Date(Date.now() + 100) } // Anında göster
          }
        ]
      });
    } catch (err) {
      console.warn('[NativeNotifications] Schedule error:', err);
    }
  } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title || 'SecureDrive VIP', {
        body: body || '',
        icon: '/favicon.ico'
      });
    } catch (e) {
      console.warn('Web notification error:', e);
    }
  }
}

/**
 * Bildirime dokunulduğunda çalışacak dinleyiciyi başlatır.
 */
export function setupNotificationTapListener(onTap) {
  if (!Capacitor.isNativePlatform()) return () => {};

  try {
    const listenerPromise = LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
      const extra = notificationAction.notification?.extra || {};
      if (typeof onTap === 'function') {
        onTap(extra);
      }
    });

    return () => {
      listenerPromise.then((handle) => handle.remove()).catch(() => {});
    };
  } catch (e) {
    console.warn('Notification tap listener setup failed:', e);
    return () => {};
  }
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
