import { supabase } from './supabase';
import { 
  AIRPORTS as FALLBACK_AIRPORTS, 
  DESTINATIONS as FALLBACK_DESTINATIONS, 
  FLEET as FALLBACK_FLEET, 
  AMENITIES as FALLBACK_AMENITIES, 
  POPULAR_ROUTES as FALLBACK_ROUTES, 
  FAQS as FALLBACK_FAQS 
} from '../data/mockData';

/**
 * 1. Fetch Fleet from Supabase (with fallback)
 */
export async function fetchFleetFromDb() {
  try {
    const { data, error } = await supabase
      .from('fleet')
      .select('*')
      .eq('is_active', true)
      .order('base_opening_rate', { ascending: true });

    if (data && data.length > 0) {
      return data.map(d => ({
        id: d.id,
        name: d.name,
        class: d.class_name || d.class,
        category: d.category,
        badge: d.badge,
        badgeColor: d.badge_color || 'gold',
        seats: d.seats,
        luggage: d.luggage,
        transmission: d.transmission,
        fuel_engine: d.fuel_engine,
        specs: { engine: d.fuel_engine, fuel: 'Dizel / Hibrit', year: '2025/2026' },
        baseOpeningRate: Number(d.base_opening_rate),
        baseRateKm: Number(d.base_rate_km),
        image: d.image_url,
        description: d.description,
        features: Array.isArray(d.features) ? d.features : []
      }));
    }
  } catch (err) {
    console.warn('Fleet fetch from DB notice:', err);
  }
  return FALLBACK_FLEET;
}

/**
 * 2. Fetch Amenities from Supabase (with fallback)
 */
export async function fetchAmenitiesFromDb() {
  try {
    const { data, error } = await supabase
      .from('amenities')
      .select('*')
      .eq('is_visible', true)
      .order('price_try', { ascending: true });

    if (data && data.length > 0) {
      return data.map(a => ({
        id: a.id,
        title: a.title,
        subtitle: a.subtitle,
        priceTRY: Number(a.price_try),
        isFree: a.is_free,
        icon: a.icon,
        hasCount: a.has_count,
        checkedByDefault: a.checked_by_default,
        category: a.category
      }));
    }
  } catch (err) {
    console.warn('Amenities fetch from DB notice:', err);
  }
  return FALLBACK_AMENITIES;
}

/**
 * 3. Fetch Airports from Supabase (with fallback)
 */
export async function fetchAirportsFromDb() {
  try {
    const { data, error } = await supabase
      .from('airports')
      .select('*')
      .order('popular', { ascending: false });

    if (data && data.length > 0) {
      return data.map(a => ({
        id: a.id,
        code: a.code,
        name: a.name,
        city: a.city,
        coords: [Number(a.lat), Number(a.lng)],
        terminal: a.terminal,
        popular: a.popular
      }));
    }
  } catch (err) {
    console.warn('Airports fetch from DB notice:', err);
  }
  return FALLBACK_AIRPORTS;
}

/**
 * 4. Fetch Destinations from Supabase (with fallback)
 */
export async function fetchDestinationsFromDb() {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('popular', { ascending: false });

    if (data && data.length > 0) {
      return data.map(d => ({
        id: d.id,
        name: d.name,
        city: d.city,
        district: d.district,
        coords: [Number(d.lat), Number(d.lng)],
        type: d.type,
        popular: d.popular
      }));
    }
  } catch (err) {
    console.warn('Destinations fetch from DB notice:', err);
  }
  return FALLBACK_DESTINATIONS;
}

/**
 * 5. Fetch Routes from Supabase (with fallback)
 */
export async function fetchRoutesFromDb() {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      return data.map(r => ({
        id: r.id,
        from: r.from_location,
        to: r.to_location,
        distanceKm: Number(r.distance_km),
        durationMin: Number(r.duration_min),
        vehicle: r.vehicle,
        priceTRY: Number(r.price_try),
        badge: r.badge,
        isActive: r.is_active !== false
      }));
    }
  } catch (err) {
    console.warn('Routes fetch from DB notice:', err);
  }
  return FALLBACK_ROUTES;
}

/**
 * 6. Fetch FAQs from Supabase (with fallback)
 */
export async function fetchFaqsFromDb() {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('display_order', { ascending: true });

    if (data && data.length > 0) {
      return data.map(f => ({
        id: f.id,
        q: f.question,
        a: f.answer,
        category: f.category
      }));
    }
  } catch (err) {
    console.warn('FAQs fetch from DB notice:', err);
  }
  return FALLBACK_FAQS;
}
