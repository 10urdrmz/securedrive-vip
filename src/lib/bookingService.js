import { supabase } from './supabase';
import {
  normalizePhone,
  mergeBookingsByCode,
  mergeBookingRecords,
  getAllLocalBookings,
  updateBookingByCode
} from './bookingStorage';
import {
  canAdvanceToStep,
  getStatusLabel,
  normalizeStatusStep,
  hasAssignedDriver
} from './bookingStatus';
import { notifyDriverAssigned, notifyStatusChange } from './notificationService';

const DEFAULT_CHAUFFEUR_PHONE = '+90 532 888 77 66';
const LEGACY_CHAUFFEUR_PHONE = '+90 533 111 22 33';

function isUuid(id) {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function bookingAssignedToDriver(booking, driver) {
  if (!booking || !driver) return false;

  const driverPhone = normalizePhone(driver.phone);
  const chauffeurPhone = normalizePhone(booking.chauffeur_phone);

  if (driverPhone.length >= 10 && chauffeurPhone.length >= 10) {
    if (driverPhone.slice(-10) === chauffeurPhone.slice(-10)) return true;
  }

  const driverName = (driver.full_name || '').trim().toLowerCase();
  const chauffeurName = (booking.chauffeur_name || '').trim().toLowerCase();
  if (driverName && chauffeurName) {
    const driverFirst = driverName.split(' ')[0];
    const chauffeurFirst = chauffeurName.split(' ')[0];
    if (driverFirst.length > 2 && chauffeurName.includes(driverFirst)) return true;
    if (chauffeurFirst.length > 2 && driverName.includes(chauffeurFirst)) return true;
  }

  if (driver.role === 'admin') return true;

  if (driver.username === 'sofor') {
    if (
      booking.chauffeur_phone === LEGACY_CHAUFFEUR_PHONE ||
      booking.chauffeur_phone === DEFAULT_CHAUFFEUR_PHONE ||
      chauffeurName.includes('kemal') ||
      chauffeurName.includes('şahin')
    ) {
      return true;
    }
  }

  return false;
}

export async function fetchDriverBookings(driver) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    console.warn('Driver bookings fetch notice:', error.message);
  }

  const remote = (data || []).filter((booking) => bookingAssignedToDriver(booking, driver));
  const local = getAllLocalBookings().filter((booking) => bookingAssignedToDriver(booking, driver));

  return mergeBookingsByCode(remote, local);
}

export async function fetchBookingByCode(code) {
  const normalizedCode = code.trim().toUpperCase();
  const localBooking = getAllLocalBookings().find((b) => b.code === normalizedCode) || null;

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('code', normalizedCode)
    .maybeSingle();

  if (error) {
    console.warn('Booking lookup notice:', error.message);
  }

  return mergeBookingRecords(data, localBooking);
}

async function persistBookingPatch(booking, patch) {
  updateBookingByCode(booking.code, patch);

  if (isUuid(booking.id)) {
    const { data, error } = await supabase
      .from('bookings')
      .update(patch)
      .eq('id', booking.id)
      .select()
      .maybeSingle();

    if (!error && data) {
      window.dispatchEvent(
        new CustomEvent('securedrive-booking-updated', { detail: { code: booking.code, patch } })
      );
      return data;
    }
    if (error) console.warn('Booking update by id failed:', error.message);
  }

  const { data, error } = await supabase
    .from('bookings')
    .update(patch)
    .eq('code', booking.code)
    .select()
    .maybeSingle();

  if (!error && data) {
    window.dispatchEvent(
      new CustomEvent('securedrive-booking-updated', { detail: { code: booking.code, patch } })
    );
    return data;
  }
  if (error) console.warn('Booking update by code failed:', error.message);

  const fallback = { ...booking, ...patch };
  window.dispatchEvent(
    new CustomEvent('securedrive-booking-updated', { detail: { code: booking.code, patch } })
  );
  return fallback;
}

export async function updateBooking(booking, patch) {
  if (!booking?.code) {
    throw new Error('Rezervasyon kodu bulunamadı.');
  }

  const fullPatch = {
    ...patch,
    updated_at: new Date().toISOString()
  };

  return persistBookingPatch(booking, fullPatch);
}

export async function updateBookingStatus(booking, { status, status_step }, options = {}) {
  const previousStep = normalizeStatusStep(booking.status_step, booking);
  const check = canAdvanceToStep(
    { ...booking, chauffeur_name: booking.chauffeur_name, chauffeur_phone: booking.chauffeur_phone },
    status_step
  );

  if (!check.ok) {
    throw new Error(check.reason);
  }

  const step = check.step;
  const label = status || getStatusLabel(step, booking);

  const updated = await updateBooking(booking, { status: label, status_step: step });

  if (step !== previousStep) {
    await notifyStatusChange({
      booking: updated,
      previousStep,
      newStep: step,
      actorRole: options.actorRole || 'system'
    });
  }

  return updated;
}

export function getAssignedDriverSnapshot(booking) {
  if (!hasAssignedDriver(booking)) return null;
  return {
    name: booking.chauffeur_name,
    phone: booking.chauffeur_phone,
    vehicle_plate: booking.vehicle_plate
  };
}

export function isSameDriverForBooking(booking, driver) {
  if (!booking || !driver) return false;

  const bookingPhone = normalizePhone(booking.chauffeur_phone).slice(-10);
  const driverPhone = normalizePhone(driver.phone).slice(-10);
  if (bookingPhone.length >= 10 && driverPhone.length >= 10 && bookingPhone === driverPhone) {
    return true;
  }

  const bookingName = (booking.chauffeur_name || '').trim().toLowerCase();
  const driverName = (driver.name || '').trim().toLowerCase();
  if (!bookingName || !driverName) return false;

  const bookingFirst = bookingName.split(' ')[0];
  const driverFirst = driverName.split(' ')[0];
  return (
    bookingName === driverName ||
    (bookingFirst.length > 2 && driverName.includes(bookingFirst)) ||
    (driverFirst.length > 2 && bookingName.includes(driverFirst))
  );
}

export async function assignDriverToBooking(booking, driver, options = {}) {
  if (!booking?.code) throw new Error('Rezervasyon kodu bulunamadı.');
  if (!driver?.name) throw new Error('Geçerli bir şoför seçiniz.');

  if (isSameDriverForBooking(booking, driver)) {
    throw new Error('Bu şoför zaten bu rezervasyona atanmış.');
  }

  const previousDriver = getAssignedDriverSnapshot(booking);
  const isReassignment = Boolean(previousDriver);

  const updated = await updateBooking(booking, {
    chauffeur_name: driver.name,
    chauffeur_phone: driver.phone || '',
    vehicle_plate: driver.vehicle_plate || booking.vehicle_plate || '',
    chauffeur_photo: driver.photo_url || booking.chauffeur_photo || null,
    status_step: 2,
    status: getStatusLabel(2, { ...booking, chauffeur_name: driver.name, chauffeur_phone: driver.phone })
  });

  await notifyDriverAssigned({
    booking: updated,
    driver,
    previousDriver,
    isReassignment,
    assignedBy: options.assignedBy || 'admin'
  });

  return updated;
}

export async function confirmVehicleAllocation(booking) {
  if (!hasAssignedDriver(booking)) {
    throw new Error('Araç tahsisi için önce VIP şoför atanmalıdır.');
  }
  return updateBookingStatus(
    booking,
    { status: getStatusLabel(3, booking), status_step: 3 },
    { actorRole: 'admin' }
  );
}

export function findDriverIdForBooking(driverList, booking) {
  if (!booking || !driverList?.length) return '';

  const bookingPhone = normalizePhone(booking.chauffeur_phone).slice(-10);
  const byPhone = driverList.find(
    (d) => normalizePhone(d.phone).slice(-10) === bookingPhone && bookingPhone.length >= 10
  );
  if (byPhone) return byPhone.id;

  const bookingName = (booking.chauffeur_name || '').trim().toLowerCase();
  const byName = driverList.find((d) => {
    const name = (d.name || '').trim().toLowerCase();
    return name && bookingName && (name.includes(bookingName) || bookingName.includes(name));
  });
  return byName?.id || '';
}
