import { supabase } from './supabase';

/** Nöbetteki veya ilk kayıtlı şoförü rezervasyon ataması için döndürür. */
export async function pickDriverForBooking() {
  try {
    const { data: onDuty } = await supabase
      .from('drivers')
      .select('name, phone, vehicle_plate, photo_url')
      .eq('status', 'on_duty')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (onDuty?.name) {
      return {
        chauffeur_name: onDuty.name,
        chauffeur_phone: onDuty.phone || '',
        vehicle_plate: onDuty.vehicle_plate || '',
        chauffeur_photo: onDuty.photo_url || null
      };
    }

    const { data: anyDriver } = await supabase
      .from('drivers')
      .select('name, phone, vehicle_plate, photo_url')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (anyDriver?.name) {
      return {
        chauffeur_name: anyDriver.name,
        chauffeur_phone: anyDriver.phone || '',
        vehicle_plate: anyDriver.vehicle_plate || '',
        chauffeur_photo: anyDriver.photo_url || null
      };
    }
  } catch (err) {
    console.warn('Driver assignment notice:', err);
  }

  return {
    chauffeur_name: 'Atanacak VIP Şoför',
    chauffeur_phone: '',
    vehicle_plate: '',
    chauffeur_photo: null
  };
}
