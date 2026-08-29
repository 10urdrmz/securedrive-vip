import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mirgkddrdnhuqolgxxqt.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_g0LhovPjnbrylnw3aLXHJg_CxZWmheI';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

/**
 * Service to create a new reservation in Supabase
 */
export async function createBookingInSupabase(bookingData) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) {
      console.warn('Supabase bookings insert notice:', error.message);
      return { success: false, data: bookingData, error };
    }
    return { success: true, data };
  } catch (err) {
    console.warn('Supabase client error, falling back locally:', err);
    return { success: false, data: bookingData, error: err };
  }
}

/**
 * Service to search a booking by its code (e.g. SDRV-2026-8812)
 */
export async function getBookingByCodeFromSupabase(code) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .maybeSingle();

    if (error) {
      console.warn('Supabase lookup notice:', error.message);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err) {
    console.warn('Supabase fetch error:', err);
    return { data: null, error: err };
  }
}
