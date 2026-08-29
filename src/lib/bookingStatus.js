import { normalizePhone } from './bookingStorage';

export const BOOKING_STATUS_STEPS = [
  { step: 1, label: 'Rezervasyon Alındı', detail: 'Şoför ataması bekleniyor', color: '#64748b' },
  { step: 2, label: 'VIP Şoför Atandı', detail: 'Şoförünüz belirlendi', color: '#2563eb' },
  { step: 3, label: 'Araç Tahsis Edildi', detail: 'VIP araç hazırlandı', color: '#1d4ed8' },
  { step: 4, label: 'Karşılama Kapısında', detail: 'Şoför kapıda bekliyor', color: '#7c3aed' },
  { step: 5, label: 'Yolcu Alındı', detail: 'Varış noktasına seyir halinde', color: '#d97706' },
  { step: 6, label: 'Transfer Tamamlandı', detail: 'Güvenli varış', color: '#10b981' }
];

const UNASSIGNED_NAMES = new Set([
  '',
  'atanmadı',
  'atanacak vip şoför',
  'atanacak',
  'vip şoför'
]);

export function hasAssignedDriver(booking) {
  if (!booking) return false;
  const name = (booking.chauffeur_name || '').trim().toLowerCase();
  const phone = normalizePhone(booking.chauffeur_phone);
  if (UNASSIGNED_NAMES.has(name)) return false;
  return Boolean(name) && phone.length >= 10;
}

/** Eski adım numaralarını (2,4,3,5) yeni lineer akışa (1-6) çevirir. */
export function normalizeStatusStep(step, booking) {
  const raw = Number(step) || 1;
  const hasDriver = hasAssignedDriver(booking);

  if (raw >= 1 && raw <= 6) {
    if (raw >= 3 && !hasDriver) return hasDriver ? raw : 1;
    if (raw === 2 && hasDriver) return 2;
    if (raw === 2 && !hasDriver) return 1;
    return raw;
  }

  // Legacy mapping
  if (raw === 4) return 4;
  if (raw === 3) return 5;
  if (raw === 5) return 6;
  if (raw === 2) return hasDriver ? 3 : 1;
  return 1;
}

export function getStatusLabel(step, booking) {
  const normalized = normalizeStatusStep(step, booking);
  return BOOKING_STATUS_STEPS.find((s) => s.step === normalized)?.label || 'Rezervasyon Alındı';
}

export function canAdvanceToStep(booking, targetStep) {
  const step = normalizeStatusStep(targetStep, booking);
  if (step < 1 || step > 6) return { ok: false, reason: 'Geçersiz durum adımı.' };
  if (step >= 2 && !hasAssignedDriver(booking)) {
    return { ok: false, reason: 'Araç tahsisi ve sonraki adımlar için önce VIP şoför atanmalıdır.' };
  }
  if (step >= 3 && !hasAssignedDriver(booking)) {
    return { ok: false, reason: 'Önce şoför ataması yapılmalıdır.' };
  }
  return { ok: true, step };
}

export function isBookingCompletedStep(booking) {
  return normalizeStatusStep(booking?.status_step, booking) >= 6;
}
