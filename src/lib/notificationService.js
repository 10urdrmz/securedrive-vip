import { supabase } from './supabase';
import { normalizePhone } from './bookingStorage';
import { getBookingDetailPathForRole } from './bookingAccess';

const LOCAL_KEY = 'securedrive_notifications';

export const NOTIFICATIONS_UPDATED_EVENT = 'securedrive-notifications-updated';
const POLL_INTERVAL_MS = 30_000;
const liveSubscriptionRegistry = new Map();

function getUserSubscriptionKey(user) {
  return String(user?.id || `${user?.role || 'guest'}:${user?.email || user?.username || 'anon'}`);
}

function createLiveSubscription(user) {
  const userKey = getUserSubscriptionKey(user);
  const listeners = new Set();

  const notify = (payload) => {
    listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.warn('Notification listener error:', err);
      }
    });
  };

  const onCustomEvent = () => notify({ event: 'refresh' });
  window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, onCustomEvent);

  const onStorage = (event) => {
    if (event.key === LOCAL_KEY || event.key === null) {
      notify({ event: 'refresh' });
    }
  };
  window.addEventListener('storage', onStorage);

  const onVisibility = () => {
    if (document.visibilityState === 'visible') {
      notify({ event: 'refresh' });
    }
  };
  document.addEventListener('visibilitychange', onVisibility);

  const channelId = `notifications-live-${userKey}`;
  const channel = supabase
    .channel(channelId)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      (payload) => {
        const row = payload.new;
        if (matchesUser(row, user)) {
          notify({ event: 'INSERT', notification: row });
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'notifications' },
      (payload) => {
        const row = payload.new;
        if (matchesUser(row, user)) {
          notify({ event: 'UPDATE', notification: row });
        }
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.warn('Bildirim realtime kanalı hatası — polling devrede.');
      }
    });

  const pollId = window.setInterval(() => {
    if (document.visibilityState === 'visible') {
      notify({ event: 'refresh' });
    }
  }, POLL_INTERVAL_MS);

  const entry = {
    userKey,
    listeners,
    channel,
    pollId,
    onCustomEvent,
    onStorage,
    onVisibility
  };

  liveSubscriptionRegistry.set(userKey, entry);
  return entry;
}

function destroyLiveSubscription(entry) {
  window.clearInterval(entry.pollId);
  window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, entry.onCustomEvent);
  window.removeEventListener('storage', entry.onStorage);
  document.removeEventListener('visibilitychange', entry.onVisibility);
  supabase.removeChannel(entry.channel);
  liveSubscriptionRegistry.delete(entry.userKey);
}

function saveNotificationLocally(notification) {
  try {
    const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    localStorage.setItem(LOCAL_KEY, JSON.stringify([notification, ...list].slice(0, 300)));
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
  } catch (e) {
    console.warn('Local notification save failed:', e);
  }
}

function getLocalNotifications() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function mergeNotifications(...sources) {
  const map = new Map();
  sources.flat().forEach((n) => {
    if (n?.id) map.set(n.id, n);
  });
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );
}

function matchesUser(notification, user) {
  if (!user || !notification) return false;

  if (notification.recipient_user_id && user.id && notification.recipient_user_id === user.id) {
    return true;
  }

  if (notification.recipient_role && notification.recipient_role !== user.role) {
    return false;
  }

  const userEmail = (user.email || '').trim().toLowerCase();
  const notifEmail = (notification.recipient_email || '').trim().toLowerCase();
  if (userEmail && notifEmail && userEmail === notifEmail) return true;

  const userPhone = normalizePhone(user.phone).slice(-10);
  const notifPhone = normalizePhone(notification.recipient_phone).slice(-10);
  if (userPhone.length >= 10 && notifPhone.length >= 10 && userPhone === notifPhone) {
    return true;
  }

  return notification.recipient_role === user.role && !notification.recipient_email && !notification.recipient_phone;
}

export async function createNotification({
  recipientRole,
  recipientUserId = null,
  recipientEmail = null,
  recipientPhone = null,
  bookingCode = null,
  type,
  title,
  message,
  linkPath = null
}) {
  const payload = {
    recipient_role: recipientRole,
    recipient_user_id: recipientUserId,
    recipient_email: recipientEmail?.trim().toLowerCase() || null,
    recipient_phone: recipientPhone || null,
    booking_code: bookingCode,
    type,
    title,
    message,
    link_path: linkPath,
    is_read: false,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.warn('Notification insert notice:', error.message);
    const local = { ...payload, id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` };
    saveNotificationLocally(local);
    return local;
  }

  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
  return data;
}

export function upsertNotificationInList(list, notification) {
  return mergeNotifications([notification], list);
}

/**
 * Canlı bildirim akışı: Supabase Realtime + sekme içi event + yedek polling.
 * @returns {() => void} unsubscribe
 */
export function subscribeToUserNotifications(user, onChange) {
  if (!user || typeof onChange !== 'function') return () => {};

  const userKey = getUserSubscriptionKey(user);
  let entry = liveSubscriptionRegistry.get(userKey);

  if (!entry) {
    try {
      entry = createLiveSubscription(user);
    } catch (err) {
      console.warn('Bildirim realtime aboneliği başlatılamadı:', err);
      const pollOnly = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
          onChange({ event: 'refresh' });
        }
      }, POLL_INTERVAL_MS);
      return () => window.clearInterval(pollOnly);
    }
  }

  entry.listeners.add(onChange);

  return () => {
    entry.listeners.delete(onChange);
    if (entry.listeners.size === 0) {
      destroyLiveSubscription(entry);
    }
  };
}

export async function fetchNotificationsForUser(user) {
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  const remote = error ? [] : (data || []).filter((n) => matchesUser(n, user));
  const local = getLocalNotifications().filter((n) => matchesUser(n, user));
  return mergeNotifications(remote, local);
}

export async function markNotificationRead(notificationId) {
  if (!notificationId) return;

  if (String(notificationId).startsWith('local_')) {
    try {
      const list = getLocalNotifications().map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      );
      localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
    } catch (e) {
      console.warn(e);
    }
    return;
  }

  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
}

export async function markAllNotificationsRead(user) {
  if (!user) return;

  const items = await fetchNotificationsForUser(user);
  const unread = items.filter((n) => !n.is_read);
  if (!unread.length) return;

  const localIds = new Set(
    unread.filter((n) => String(n.id).startsWith('local_')).map((n) => n.id)
  );
  const remoteIds = unread
    .filter((n) => !String(n.id).startsWith('local_'))
    .map((n) => n.id);

  if (localIds.size) {
    const list = getLocalNotifications().map((n) =>
      localIds.has(n.id) ? { ...n, is_read: true } : n
    );
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  }

  if (remoteIds.length) {
    await supabase.from('notifications').update({ is_read: true }).in('id', remoteIds);
  }

  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
}

function removeLocalNotificationsForUser(user) {
  const remaining = getLocalNotifications().filter((n) => !matchesUser(n, user));
  localStorage.setItem(LOCAL_KEY, JSON.stringify(remaining));
}

export async function clearAllNotificationsForUser(user) {
  if (!user) return;

  const items = await fetchNotificationsForUser(user);
  const remoteIds = items
    .filter((n) => !String(n.id).startsWith('local_'))
    .map((n) => n.id);

  if (remoteIds.length) {
    await supabase.from('notifications').delete().in('id', remoteIds);
  }

  removeLocalNotificationsForUser(user);
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
}

export async function notifyDriverAssigned({
  booking,
  driver,
  previousDriver = null,
  isReassignment = false,
  assignedBy = 'admin'
}) {
  if (!booking?.code || !driver?.name) return;

  const customerLink = getBookingDetailPathForRole(booking.code, 'customer');
  const driverLink = getBookingDetailPathForRole(booking.code, 'driver');
  const driverHomeLink = getBookingDetailPathForRole(null, 'driver');

  const notifications = [];

  if (isReassignment && previousDriver?.phone) {
    notifications.push(
      createNotification({
        recipientRole: 'driver',
        recipientPhone: previousDriver.phone,
        bookingCode: booking.code,
        type: 'assignment_cancelled',
        title: 'Transfer Görevi Kaldırıldı',
        message: `${booking.code} rezervasyonundaki göreviniz iptal edildi. Bu transfer için yeni bir şoför atandı.`,
        linkPath: driverHomeLink
      }),
      createNotification({
        recipientRole: 'customer',
        recipientEmail: booking.passenger_email,
        recipientPhone: booking.passenger_phone,
        bookingCode: booking.code,
        type: 'driver_changed',
        title: 'VIP Şoförünüz Değiştirildi',
        message: `${booking.code}: Yeni şoförünüz ${driver.name}. Tel: ${driver.phone || '—'}`,
        linkPath: customerLink
      }),
      createNotification({
        recipientRole: 'admin',
        bookingCode: booking.code,
        type: 'driver_changed_admin',
        title: 'Şoför Değiştirildi',
        message: `${booking.code}: ${previousDriver.name} → ${driver.name} (${assignedBy})`,
        linkPath: `/admin/reservations/${booking.code}`
      })
    );
  } else {
    notifications.push(
      createNotification({
        recipientRole: 'customer',
        recipientEmail: booking.passenger_email,
        recipientPhone: booking.passenger_phone,
        bookingCode: booking.code,
        type: 'driver_assigned',
        title: 'VIP Şoförünüz Atandı',
        message: `${booking.code} rezervasyonunuza ${driver.name} atandı. Tel: ${driver.phone || '—'}`,
        linkPath: customerLink
      }),
      createNotification({
        recipientRole: 'admin',
        bookingCode: booking.code,
        type: 'driver_assigned_admin',
        title: 'Şoför Ataması Yapıldı',
        message: `${booking.code} → ${driver.name} (${assignedBy})`,
        linkPath: `/admin/reservations/${booking.code}`
      })
    );
  }

  notifications.push(
    createNotification({
      recipientRole: 'driver',
      recipientEmail: driver.account?.email,
      recipientPhone: driver.phone,
      recipientUserId: driver.app_user_id || null,
      bookingCode: booking.code,
      type: isReassignment ? 'reassigned' : 'new_assignment',
      title: isReassignment ? 'Yeni Transfer Görevi (Yeniden Atama)' : 'Yeni Transfer Görevi',
      message: `${booking.passenger_name} · ${booking.pickup_location} → ${booking.destination_location}`,
      linkPath: driverLink
    })
  );

  await Promise.all(notifications);
}

export async function notifyStatusChange({ booking, previousStep, newStep, actorRole = 'system' }) {
  if (!booking?.code) return;

  const customerLink = getBookingDetailPathForRole(booking.code, 'customer');
  const driverLink = getBookingDetailPathForRole(booking.code, 'driver');

  const statusLabel = booking.status || `Adım ${newStep}`;

  await Promise.all([
    createNotification({
      recipientRole: 'customer',
      recipientEmail: booking.passenger_email,
      recipientPhone: booking.passenger_phone,
      bookingCode: booking.code,
      type: 'status_update',
      title: 'Transfer Durumu Güncellendi',
      message: `${booking.code}: ${statusLabel}`,
      linkPath: customerLink
    }),
    createNotification({
      recipientRole: 'driver',
      recipientPhone: booking.chauffeur_phone,
      bookingCode: booking.code,
      type: 'status_update',
      title: 'Görev Durumu Güncellendi',
      message: `${booking.code}: ${statusLabel}`,
      linkPath: driverLink
    })
  ]);

  if (actorRole === 'driver' && newStep >= 4) {
    await createNotification({
      recipientRole: 'admin',
      bookingCode: booking.code,
      type: 'driver_action',
      title: 'Şoför Durum Bildirimi',
      message: `${booking.chauffeur_name} · ${booking.code} · ${statusLabel}`,
      linkPath: `/admin/reservations/${booking.code}`
    });
  }
}

export async function notifyBookingCreated(booking) {
  if (!booking?.code) return;

  await createNotification({
    recipientRole: 'customer',
    recipientEmail: booking.passenger_email,
    recipientPhone: booking.passenger_phone,
    bookingCode: booking.code,
    type: 'booking_created',
    title: 'Rezervasyonunuz Alındı',
    message: `${booking.code} oluşturuldu. VIP şoför ataması yapıldığında bilgilendirileceksiniz.`,
    linkPath: getBookingDetailPathForRole(booking.code, 'customer')
  });

  await createNotification({
    recipientRole: 'admin',
    bookingCode: booking.code,
    type: 'booking_created_admin',
    title: 'Yeni Rezervasyon',
    message: `${booking.code} · ${booking.passenger_name} — şoför ataması bekliyor`,
    linkPath: `/admin/reservations/${booking.code}`
  });
}
