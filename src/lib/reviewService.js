import { supabase } from './supabase';
import { normalizePhone } from './bookingStorage';
import { isBookingCompletedStep } from './bookingStatus';

const LOCAL_KEY = 'securedrive_driver_reviews';

export function isBookingCompleted(booking) {
  if (!booking) return false;
  if (isBookingCompletedStep(booking)) return true;
  const status = (booking.status || '').toLowerCase();
  return status.includes('tamamland') || status.includes('completed');
}

export function isComplaintReview(review) {
  if (!review) return false;
  return review.feedback_type === 'complaint' || Number(review.rating) <= 2;
}

function normalizeName(value) {
  return (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i');
}

function nameMatchScore(reviewName, driverName) {
  const review = normalizeName(reviewName);
  const driver = normalizeName(driverName);
  if (!review || !driver) return 0;

  if (review === driver) return 100;
  if (review.includes(driver) || driver.includes(review)) return 80;

  const reviewFirst = review.split(/\s+/)[0] || '';
  const driverFirst = driver.split(/\s+/)[0] || '';
  if (reviewFirst.length > 2 && driver.includes(reviewFirst)) return 60;
  if (driverFirst.length > 2 && review.includes(driverFirst)) return 60;

  return 0;
}

/** Her değerlendirmeyi tek bir şoföre bağlar (telefon + isim puanı). */
export function resolveDriverForReview(review, drivers = []) {
  if (!review || !drivers.length) return null;

  const reviewPhone = normalizePhone(review.chauffeur_phone).slice(-10);

  const scored = drivers
    .map((driver) => {
      let score = 0;
      const driverPhone = normalizePhone(driver.phone).slice(-10);

      if (reviewPhone.length >= 10 && driverPhone.length >= 10 && reviewPhone === driverPhone) {
        score += 50;
      }

      score += nameMatchScore(review.chauffeur_name, driver.name);

      return { driver, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.driver || null;
}

export function reviewBelongsToDriver(review, driver, drivers = []) {
  if (!review || !driver) return false;
  const owner = resolveDriverForReview(review, drivers.length ? drivers : [driver]);
  return owner?.id === driver.id;
}

function buildStatsFromReviews(reviews, drivers = []) {
  const byDriverId = {};

  drivers.forEach((driver) => {
    byDriverId[driver.id] = {
      count: 0,
      totalRating: 0,
      complaints: 0,
      recent: [],
      complaintReviews: []
    };
  });

  reviews.forEach((review) => {
    const driver = resolveDriverForReview(review, drivers);
    if (!driver?.id || !byDriverId[driver.id]) return;

    const stat = byDriverId[driver.id];
    stat.count += 1;
    stat.totalRating += Number(review.rating) || 0;

    if (isComplaintReview(review)) {
      stat.complaints += 1;
      stat.complaintReviews.push(review);
    }

    if (stat.recent.length < 3) {
      stat.recent.push(review);
    }
  });

  Object.keys(byDriverId).forEach((driverId) => {
    const stat = byDriverId[driverId];
    if (stat.count > 0) {
      stat.average = Math.round((stat.totalRating / stat.count) * 100) / 100;
    }
    stat.complaintReviews.sort(
      (a, b) => new Date(b.created_at || b._savedAt || 0) - new Date(a.created_at || a._savedAt || 0)
    );
  });

  return byDriverId;
}

function saveReviewLocally(review) {
  try {
    const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    const next = [review, ...list.filter((r) => r.booking_code !== review.booking_code)].slice(0, 200);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('Local review save failed:', e);
  }
}

function getLocalReviews() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function mergeReviewMaps(...sources) {
  const map = new Map();
  sources.flat().forEach((review) => {
    if (review?.booking_code) map.set(review.booking_code, review);
  });
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at || b._savedAt || 0) - new Date(a.created_at || a._savedAt || 0)
  );
}

export async function fetchAllDriverReviews() {
  const { data, error } = await supabase
    .from('driver_reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.warn('All reviews fetch notice:', error.message);
  }

  return mergeReviewMaps(error ? [] : data || [], getLocalReviews());
}

export function getComplaintsFromReviews(reviews = []) {
  return reviews.filter(isComplaintReview);
}

export async function fetchReviewsForBookingCodes(codes = []) {
  const normalized = [...new Set(codes.filter(Boolean))];
  if (normalized.length === 0) return {};

  const { data, error } = await supabase
    .from('driver_reviews')
    .select('*')
    .in('booking_code', normalized);

  if (error) {
    console.warn('Reviews fetch notice:', error.message);
  }

  const map = new Map();
  mergeReviewMaps(data || [], getLocalReviews()).forEach((review) => {
    if (normalized.includes(review.booking_code)) {
      map.set(review.booking_code, review);
    }
  });

  return Object.fromEntries(map);
}

export async function submitDriverReview({ booking, user, rating, feedbackType, comment }) {
  if (!booking?.code) throw new Error('Rezervasyon kodu bulunamadı.');
  if (!rating || rating < 1 || rating > 5) throw new Error('Lütfen 1-5 arası puan verin.');

  const payload = {
    booking_code: booking.code,
    booking_id: booking.id || null,
    passenger_name: user?.full_name || booking.passenger_name,
    passenger_email: user?.email || booking.passenger_email || null,
    passenger_phone: user?.phone || booking.passenger_phone || null,
    chauffeur_name: booking.chauffeur_name || 'VIP Şoför',
    chauffeur_phone: booking.chauffeur_phone || '',
    rating,
    feedback_type: feedbackType || (rating <= 2 ? 'complaint' : rating <= 3 ? 'neutral' : 'praise'),
    comment: comment?.trim() || null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('driver_reviews')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.warn('Review insert notice:', error.message);
    const isDuplicate = error.code === '23505';
    if (isDuplicate) {
      return { success: false, error: 'Bu transfer için zaten değerlendirme yaptınız.' };
    }
    saveReviewLocally({ ...payload, id: `local_${Date.now()}` });
    return {
      success: true,
      data: payload,
      savedLocally: true
    };
  }

  await syncDriverRatingFromReviews(payload.chauffeur_phone);
  return { success: true, data };
}

async function syncDriverRatingFromReviews(chauffeurPhone) {
  const phone = normalizePhone(chauffeurPhone);
  if (phone.length < 10) return;

  const { data: reviews } = await supabase.from('driver_reviews').select('rating, chauffeur_phone');
  const matched = (reviews || []).filter(
    (r) => normalizePhone(r.chauffeur_phone).slice(-10) === phone.slice(-10)
  );

  if (matched.length === 0) return;

  const avg = matched.reduce((sum, r) => sum + r.rating, 0) / matched.length;

  const { data: drivers } = await supabase.from('drivers').select('id, phone');
  const driver = (drivers || []).find(
    (d) => normalizePhone(d.phone).slice(-10) === phone.slice(-10)
  );

  if (driver?.id) {
    await supabase
      .from('drivers')
      .update({
        rating: Math.round(avg * 100) / 100,
        transfers_count: matched.length
      })
      .eq('id', driver.id);
  }
}

export async function fetchDriverReviewStats(drivers = []) {
  const reviews = await fetchAllDriverReviews();

  if (drivers.length > 0) {
    return buildStatsFromReviews(reviews, drivers);
  }

  // Geriye dönük: şoför listesi yoksa telefon anahtarıyla grupla (driver portal vb.)
  const byPhone = {};

  reviews.forEach((review) => {
    const key = normalizePhone(review.chauffeur_phone).slice(-10);
    if (!key) return;
    if (!byPhone[key]) {
      byPhone[key] = {
        count: 0,
        totalRating: 0,
        complaints: 0,
        recent: [],
        complaintReviews: []
      };
    }
    byPhone[key].count += 1;
    byPhone[key].totalRating += review.rating;
    if (isComplaintReview(review)) {
      byPhone[key].complaints += 1;
      byPhone[key].complaintReviews.push(review);
    }
    if (byPhone[key].recent.length < 3) {
      byPhone[key].recent.push(review);
    }
  });

  Object.keys(byPhone).forEach((key) => {
    const stat = byPhone[key];
    stat.average = Math.round((stat.totalRating / stat.count) * 100) / 100;
    stat.complaintReviews.sort(
      (a, b) => new Date(b.created_at || b._savedAt || 0) - new Date(a.created_at || a._savedAt || 0)
    );
  });

  return byPhone;
}

export function getDriverStatsForPhone(statsMap, phone) {
  const key = normalizePhone(phone).slice(-10);
  return statsMap[key] || null;
}

export function getDriverStatsById(statsMap, driverId) {
  return statsMap[driverId] || null;
}
