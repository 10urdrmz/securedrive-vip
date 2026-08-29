export const BOOKING_WIZARD_PATHS = {
  vehicle: '/rezervasyon/vehicle-select',
  amenities: '/rezervasyon/amenities',
  passenger: '/rezervasyon/passenger-info',
  confirmation: '/rezervasyon/confirmation'
};

export const BOOKING_WIZARD_ALIASES = {
  'arac-secimi': BOOKING_WIZARD_PATHS.vehicle,
  ozellikler: BOOKING_WIZARD_PATHS.amenities,
  'yolcu-bilgileri': BOOKING_WIZARD_PATHS.passenger,
  onay: BOOKING_WIZARD_PATHS.confirmation
};

const DRAFT_KEY = 'securedrive_booking_draft_v1';
const SUBMITTED_KEY = 'securedrive_booking_submitted_v1';
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
const SUBMITTED_TTL_MS = 24 * 60 * 60 * 1000;

let submitInFlight = null;

export function hasValidSearchDraft({ pickup, destination, datetime }) {
  if (!pickup?.name?.trim() || !destination?.name?.trim()) return false;
  if (!datetime) return false;

  const transferDate = new Date(datetime);
  if (Number.isNaN(transferDate.getTime())) return false;

  return transferDate.getTime() > Date.now() - 5 * 60 * 1000;
}

export function hasSelectedVehicle(selectedVehicleId, fleet = []) {
  return Boolean(selectedVehicleId && fleet.some((vehicle) => vehicle.id === selectedVehicleId));
}

export function getWizardStepFromPath(pathname = '') {
  if (pathname.includes('/vehicle-select') || pathname.includes('/arac-secimi')) return 'vehicle';
  if (pathname.includes('/amenities') || pathname.includes('/ozellikler')) return 'amenities';
  if (pathname.includes('/passenger-info') || pathname.includes('/yolcu-bilgileri')) return 'passenger';
  if (pathname.includes('/confirmation') || pathname.includes('/onay')) return 'confirmation';
  return null;
}

export function saveBookingDraft(draft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, savedAt: Date.now() }));
  } catch (err) {
    console.warn('Booking draft save notice:', err);
  }
}

export function loadBookingDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (Date.now() - (parsed.savedAt || 0) > DRAFT_TTL_MS) {
      clearBookingDraft();
      return null;
    }

    return parsed;
  } catch (err) {
    console.warn('Booking draft load notice:', err);
    return null;
  }
}

export function clearBookingDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch (err) {
    console.warn('Booking draft clear notice:', err);
  }
}

export function buildBookingFingerprint({
  pickupId,
  destinationId,
  datetime,
  selectedVehicleId,
  tripType,
  serviceType,
  pax,
  luggage,
  flightNo,
  selectedAmenities = {},
  passenger = {}
}) {
  const amenityKey = Object.entries(selectedAmenities)
    .filter(([, value]) => value?.selected)
    .map(([id, value]) => `${id}:${value.count || 0}`)
    .sort()
    .join('|');

  return [
    pickupId,
    destinationId,
    datetime,
    selectedVehicleId,
    tripType,
    serviceType,
    pax,
    luggage,
    flightNo?.trim(),
    amenityKey,
    passenger.email?.trim().toLowerCase(),
    passenger.phone?.trim(),
    passenger.name?.trim().toLowerCase(),
    passenger.surname?.trim().toLowerCase()
  ].filter((value) => value !== undefined && value !== null && value !== '').join('::');
}

export function markSubmittedBooking(booking, fingerprint) {
  if (!booking?.code) return;

  try {
    sessionStorage.setItem(SUBMITTED_KEY, JSON.stringify({
      code: booking.code,
      booking,
      fingerprint,
      submittedAt: Date.now()
    }));
  } catch (err) {
    console.warn('Submitted booking save notice:', err);
  }
}

export function loadSubmittedBookingRecord() {
  try {
    const raw = sessionStorage.getItem(SUBMITTED_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (Date.now() - (parsed.submittedAt || 0) > SUBMITTED_TTL_MS) {
      clearSubmittedBooking();
      return null;
    }

    return parsed;
  } catch (err) {
    console.warn('Submitted booking load notice:', err);
    return null;
  }
}

export function getSubmittedBookingByFingerprint(fingerprint) {
  const record = loadSubmittedBookingRecord();
  if (!record || record.fingerprint !== fingerprint) return null;
  return record.booking || null;
}

export function getSubmittedBookingByCode(code) {
  const record = loadSubmittedBookingRecord();
  if (!record || record.code !== code) return null;
  return record.booking || null;
}

export function clearSubmittedBooking() {
  try {
    sessionStorage.removeItem(SUBMITTED_KEY);
  } catch (err) {
    console.warn('Submitted booking clear notice:', err);
  }
}

export function getConfirmationPath(code) {
  if (!code) return BOOKING_WIZARD_PATHS.confirmation;
  return `${BOOKING_WIZARD_PATHS.confirmation}?code=${encodeURIComponent(code)}`;
}

export function beginSubmitLock(fingerprint) {
  if (submitInFlight === fingerprint) return false;
  submitInFlight = fingerprint;
  return true;
}

export function releaseSubmitLock(fingerprint) {
  if (submitInFlight === fingerprint) {
    submitInFlight = null;
  }
}
