import { getCurrentUser } from './auth';
import { bookingBelongsToUser } from './bookingStorage';
import { bookingAssignedToDriver } from './bookingService';

export function normalizeBookingCode(code) {
  return (code || '').trim().toUpperCase();
}

export function normalizePersonName(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ');
}

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

/**
 * Misafir erişimi: kayıtlı ad soyad VE e-posta tam eşleşmeli (kısmi arama yok).
 */
export function verifyGuestAccess(booking, credentials) {
  if (!booking) return false;

  const fullName = typeof credentials === 'string' ? '' : credentials?.fullName;
  const email = typeof credentials === 'string' ? '' : credentials?.email;

  if (!fullName?.trim() || !email?.trim()) return false;
  if (!booking.passenger_name?.trim() || !booking.passenger_email?.trim()) return false;

  const nameMatches =
    normalizePersonName(fullName) === normalizePersonName(booking.passenger_name);
  const emailMatches =
    normalizeEmail(email) === normalizeEmail(booking.passenger_email);

  return nameMatches && emailMatches;
}

export function getBookingAccess(user, booking, guestVerified = false) {
  if (!booking) {
    return { allowed: false, level: 'none', message: 'Rezervasyon bulunamadı.' };
  }

  if (user?.role === 'admin') {
    return { allowed: true, level: 'admin' };
  }

  if (user?.role === 'driver' && bookingAssignedToDriver(booking, user)) {
    return { allowed: true, level: 'driver' };
  }

  if (user?.role === 'customer' && bookingBelongsToUser(booking, user)) {
    return { allowed: true, level: 'customer' };
  }

  if (!user && guestVerified) {
    return { allowed: true, level: 'guest' };
  }

  if (!user) {
    return {
      allowed: false,
      level: 'guest',
      needsVerification: true,
      message: 'Bu rezervasyonu görüntülemek için kayıtlı ad soyad ve e-posta doğrulaması gereklidir.'
    };
  }

  return {
    allowed: false,
    level: 'denied',
    message: 'Bu rezervasyona erişim yetkiniz bulunmuyor.'
  };
}

export function getBookingDetailPath(code, user = getCurrentUser()) {
  const normalized = normalizeBookingCode(code);
  if (!normalized) return '/';

  if (user?.role === 'admin') return `/admin/reservations/${normalized}`;
  if (user?.role === 'driver') return `/driver/rezervasyon/${normalized}`;
  if (user?.role === 'customer') return `/account/rezervasyon/${normalized}`;
  return `/rezervasyon/${normalized}`;
}

export function getBookingDetailPathForRole(code, role) {
  const normalized = normalizeBookingCode(code);
  if (!normalized) return '/';
  if (role === 'admin') return `/admin/reservations/${normalized}`;
  if (role === 'driver') return `/driver/rezervasyon/${normalized}`;
  if (role === 'customer') return `/account/rezervasyon/${normalized}`;
  return `/rezervasyon/${normalized}`;
}
