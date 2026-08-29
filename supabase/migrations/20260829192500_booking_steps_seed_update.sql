-- Demo rezervasyonları yeni 6 adımlı akışa uyarla
UPDATE public.bookings SET status = 'VIP Şoför Atandı', status_step = 2
WHERE code = 'SDRV-2026-6052';

UPDATE public.bookings SET status = 'Karşılama Kapısında', status_step = 4
WHERE code = 'SDRV-2026-8812';

UPDATE public.bookings SET status = 'Araç Tahsis Edildi', status_step = 3
WHERE code = 'SDRV-2026-4521';

UPDATE public.bookings SET status = 'Transfer Tamamlandı', status_step = 6
WHERE code = 'SDRV-2026-9051';

UPDATE public.bookings SET status = 'Araç Tahsis Edildi', status_step = 3
WHERE code IN ('SDRV-2026-4172', 'SDRV-2026-5502');
