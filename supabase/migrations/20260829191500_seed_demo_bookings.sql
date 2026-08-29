-- ==============================================================================
-- SecureDrive VIP — Demo / örnek rezervasyonlar (eskiden uygulama içi sahte veri)
-- Supabase SQL Editor'da bir kez çalıştırın.
-- ==============================================================================

-- Örnek rezervasyonlar (ON CONFLICT ile güvenli)
INSERT INTO public.bookings (
  code, status, status_step,
  passenger_name, passenger_phone, passenger_email,
  flight_no, pickup_location, destination_location,
  service_type, trip_type, transfer_datetime,
  pax_count, luggage_count,
  vehicle_id, vehicle_name, vehicle_plate,
  chauffeur_name, chauffeur_phone,
  total_price_try, currency, payment_method, payment_status
) VALUES
(
  'SDRV-2026-6052',
  'Tahsis Onaylandı', 2,
  'Onur Sefa', '+90 532 999 88 77', 'yolcu@example.com',
  'TK 1984', 'Sabiha Gökçen Havalimanı (SAW)', 'Kadıköy Moda Sahili',
  'transfer', 'oneway', NOW() - INTERVAL '2 days',
  2, 2,
  'vito-vip', 'Mercedes-Benz Vito VIP Lounge', '34 VIP 645',
  'Şahin T. (Kıdemli VIP Şoför)', '+90 533 111 22 33',
  3570, 'TRY', 'credit-card', 'completed'
),
(
  'SDRV-2026-8812',
  'VIP Şoför Havalimanında Bekliyor (Kapı #9)', 4,
  'Mehmet Demir', '+90 532 111 22 33', 'mehmet.demir@example.com',
  'TK 2410', 'İstanbul Havalimanı (IST)', 'Çırağan Palace Kempinski',
  'transfer', 'oneway', NOW() - INTERVAL '1 day',
  2, 3,
  'v-class-maybach', 'Mercedes-Benz V-Class Maybach Edition', '34 VIP 770',
  'Kemal S. (Protokol Şoförü)', '+90 532 888 77 66',
  2850, 'TRY', 'credit-card', 'completed'
),
(
  'SDRV-2026-4521',
  'Araç Tahsis Edildi', 2,
  'Canan Aksoy', '+90 533 444 55 66', 'canan.aksoy@example.com',
  'PC 2814', 'Sabiha Gökçen Havalimanı (SAW)', 'Swissôtel The Bosphorus',
  'transfer', 'oneway', NOW() + INTERVAL '1 day',
  2, 2,
  'vito-vip', 'Mercedes-Benz Vito VIP Lounge', '34 VIP 412',
  'Şahin T. (Kıdemli VIP Şoför)', '+90 533 111 22 33',
  1850, 'TRY', 'credit-card', 'pending'
),
(
  'SDRV-2026-9051',
  'Transfer Başarıyla Tamamlandı', 5,
  'Onur Sefa', '+90 552 281 7345', 'yolcu@example.com',
  'TK 1884', 'İstanbul Havalimanı (IST)', 'Çırağan Palace Kempinski',
  'transfer', 'oneway', NOW() - INTERVAL '5 days',
  2, 2,
  'vito-vip', 'Mercedes-Benz Vito VIP Lounge', '34 VIP 070',
  'Mehmet Özdemir', '+90 533 555 44 33',
  4368, 'TRY', 'credit-card', 'completed'
),
(
  'SDRV-2026-4172',
  'Araç Tahsis Edildi', 2,
  'Onur Sefa', '+90 552 281 7345', 'yolcu@example.com',
  'TK 1884', 'İstanbul Havalimanı (IST)', 'Çırağan Palace Kempinski',
  'transfer', 'oneway', NOW() - INTERVAL '3 days',
  2, 2,
  'vito-vip', 'Mercedes-Benz Vito VIP Lounge', '34 VIP 746',
  'Kemal S. (Protokol Şoförü)', '+90 532 888 77 66',
  3118, 'TRY', 'credit-card', 'completed'
),
(
  'SDRV-2026-5502',
  'Araç Tahsis Edildi', 2,
  'Onur Sefa', '+90 552 281 7345', 'yolcu@example.com',
  'TK 1884', 'İstanbul Havalimanı (IST)', 'Çırağan Palace Kempinski',
  'transfer', 'oneway', NOW() - INTERVAL '1 day',
  2, 2,
  'vito-vip', 'Mercedes-Benz Vito VIP Lounge', '34 VIP 831',
  'Kemal S. (Protokol Şoförü)', '+90 532 888 77 66',
  3668, 'TRY', 'credit-card', 'completed'
)
ON CONFLICT (code) DO UPDATE SET
  status = EXCLUDED.status,
  status_step = EXCLUDED.status_step,
  passenger_name = EXCLUDED.passenger_name,
  passenger_phone = EXCLUDED.passenger_phone,
  passenger_email = EXCLUDED.passenger_email,
  vehicle_plate = EXCLUDED.vehicle_plate,
  chauffeur_name = EXCLUDED.chauffeur_name,
  chauffeur_phone = EXCLUDED.chauffeur_phone,
  total_price_try = EXCLUDED.total_price_try,
  updated_at = NOW();

-- Örnek şoför şikayeti (SDRV-2026-9051)
INSERT INTO public.driver_reviews (
  booking_code,
  passenger_name,
  passenger_email,
  passenger_phone,
  chauffeur_name,
  chauffeur_phone,
  rating,
  feedback_type,
  comment
) VALUES (
  'SDRV-2026-9051',
  'Onur Sefa',
  'yolcu@example.com',
  '+90 552 281 7345',
  'Mehmet Özdemir',
  '+90 533 555 44 33',
  1,
  'complaint',
  'Mehmet neden böyle mehmet'
)
ON CONFLICT (booking_code) DO UPDATE SET
  rating = EXCLUDED.rating,
  feedback_type = EXCLUDED.feedback_type,
  comment = EXCLUDED.comment,
  updated_at = NOW();
