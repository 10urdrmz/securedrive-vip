const STORAGE_KEY = 'securedrive_user_bookings';

export function normalizePhone(phone) {
  return (phone || '').replace(/[^0-9]/g, '');
}

export function bookingBelongsToUser(booking, user) {
  if (!booking || !user) return false;

  const userEmail = (user.email || '').trim().toLowerCase();
  const bookingEmail = (booking.passenger_email || '').trim().toLowerCase();
  if (userEmail && bookingEmail && userEmail === bookingEmail) return true;

  const userPhone = normalizePhone(user.phone);
  const bookingPhone = normalizePhone(booking.passenger_phone);
  if (userPhone.length >= 10 && bookingPhone.length >= 10) {
    const userTail = userPhone.slice(-10);
    const bookingTail = bookingPhone.slice(-10);
    if (userTail === bookingTail) return true;
  }

  const userName = (user.full_name || '').trim().toLowerCase();
  const passengerName = (booking.passenger_name || '').trim().toLowerCase();
  if (userName && passengerName) {
    if (passengerName === userName) return true;
    const parts = userName.split(/\s+/).filter((p) => p.length > 2);
    if (parts.length > 0 && parts.every((part) => passengerName.includes(part))) return true;
  }

  return false;
}

function ownerKey(user) {
  return user?.id || user?.email || user?.username || 'guest';
}

export function saveBookingForUser(user, booking) {
  if (!user || !booking?.code) return;

  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const keys = new Set(
      [
        ownerKey(user),
        user.email?.trim().toLowerCase(),
        normalizePhone(user.phone) || null
      ].filter(Boolean)
    );

    const entry = {
      ...booking,
      passenger_email: booking.passenger_email || user.email || '',
      passenger_phone: booking.passenger_phone || user.phone || '',
      _savedAt: new Date().toISOString()
    };

    keys.forEach((key) => {
      const list = Array.isArray(all[key]) ? all[key] : [];
      all[key] = [entry, ...list.filter((b) => b.code !== booking.code)].slice(0, 50);
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('Local booking save failed:', e);
  }
}

export function getLocalBookingsForUser(user) {
  if (!user) return [];
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const keys = new Set(
      [
        ownerKey(user),
        user.email?.trim().toLowerCase(),
        normalizePhone(user.phone) || null
      ].filter(Boolean)
    );

    const merged = [];
    keys.forEach((key) => {
      if (Array.isArray(all[key])) merged.push(...all[key]);
    });
    return mergeBookingsByCode(merged);
  } catch {
    return [];
  }
}

function bookingTimestamp(booking) {
  return new Date(booking?.updated_at || booking?._savedAt || booking?.created_at || 0).getTime();
}

export function mergeBookingRecords(a, b) {
  if (!a) return b || null;
  if (!b) return a;

  const aTime = bookingTimestamp(a);
  const bTime = bookingTimestamp(b);

  return aTime >= bTime ? { ...b, ...a } : { ...a, ...b };
}

export function mergeBookingsByCode(...lists) {
  const map = new Map();
  lists.flat().forEach((booking) => {
    if (!booking?.code) return;
    const existing = map.get(booking.code);
    map.set(booking.code, existing ? mergeBookingRecords(existing, booking) : booking);
  });
  return Array.from(map.values()).sort(
    (a, b) => bookingTimestamp(b) - bookingTimestamp(a)
  );
}

export function getAllLocalBookings() {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const merged = [];
    Object.values(all).forEach((list) => {
      if (Array.isArray(list)) merged.push(...list);
    });
    return mergeBookingsByCode(merged);
  } catch {
    return [];
  }
}

export function updateBookingByCode(code, patch) {
  if (!code) return false;

  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    let updated = false;

    Object.keys(all).forEach((key) => {
      if (!Array.isArray(all[key])) return;
      all[key] = all[key].map((booking) => {
        if (booking.code !== code) return booking;
        updated = true;
        return {
          ...booking,
          ...patch,
          updated_at: patch.updated_at || new Date().toISOString()
        };
      });
    });

    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(
        new CustomEvent('securedrive-booking-updated', { detail: { code, patch } })
      );
    }
    return updated;
  } catch (e) {
    console.warn('Local booking update failed:', e);
    return false;
  }
}
