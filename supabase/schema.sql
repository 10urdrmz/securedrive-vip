-- ==============================================================================
-- SecureDrive VIP — Complete Master Supabase SQL Schema (Idempotent & Safe)
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. App Users Table (Yöneticiler, Şoförler, Yolcular)
CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer', -- 'admin', 'driver', 'customer'
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select app_users" ON public.app_users;
CREATE POLICY "Allow public select app_users" ON public.app_users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert app_users" ON public.app_users;
CREATE POLICY "Allow public insert app_users" ON public.app_users FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update app_users" ON public.app_users;
CREATE POLICY "Allow public update app_users" ON public.app_users FOR UPDATE USING (true);

INSERT INTO public.app_users (username, email, password_hash, full_name, phone, role)
VALUES 
    ('admin', 'admin@securedrive.com', 'admin123', 'Operasyon Müdürü', '+90 532 100 00 00', 'admin'),
    ('sofor', 'sofor@securedrive.com', 'sofor123', 'Kemal S. (Protokol Şoförü)', '+90 532 888 77 66', 'driver'),
    ('yolcu', 'yolcu@example.com', 'yolcu123', 'Onur Sefa', '+90 532 999 88 77', 'customer')
ON CONFLICT (username) DO UPDATE 
SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, full_name = EXCLUDED.full_name;

-- 2. Havalimanları Tablosu (Airports)
CREATE TABLE IF NOT EXISTS public.airports (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    terminal TEXT NOT NULL,
    popular BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.airports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select airports" ON public.airports;
CREATE POLICY "Allow public select airports" ON public.airports FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert airports" ON public.airports;
CREATE POLICY "Allow public insert airports" ON public.airports FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update airports" ON public.airports;
CREATE POLICY "Allow public update airports" ON public.airports FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete airports" ON public.airports;
CREATE POLICY "Allow public delete airports" ON public.airports FOR DELETE USING (true);

INSERT INTO public.airports (id, code, name, city, lat, lng, terminal, popular)
VALUES
    ('IST', 'IST', 'İstanbul Havalimanı (IST)', 'İstanbul', 41.2753, 28.7519, 'Ana VIP Terminal', true),
    ('SAW', 'SAW', 'Sabiha Gökçen Havalimanı (SAW)', 'İstanbul', 40.8986, 29.3092, 'Dış Hatlar CIP', true),
    ('AYT', 'AYT', 'Antalya Havalimanı (AYT)', 'Antalya', 36.8987, 30.8005, 'CIP Salonu', true),
    ('BJV', 'BJV', 'Bodrum Milas Havalimanı (BJV)', 'Muğla / Bodrum', 37.2506, 27.6644, 'Genel Havacılık', true),
    ('DLM', 'DLM', 'Dalaman Havalimanı (DLM)', 'Muğla / Fethiye', 36.7131, 28.7925, 'VIP Kapısı', false),
    ('ADB', 'ADB', 'İzmir Adnan Menderes (ADB)', 'İzmir', 38.2924, 27.1570, 'İç & Dış Hatlar', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, terminal = EXCLUDED.terminal;

-- 3. Varış Noktaları & Oteller (Destinations)
CREATE TABLE IF NOT EXISTS public.destinations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    type TEXT NOT NULL DEFAULT 'hotel', -- 'hotel', 'district', 'marina'
    popular BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select destinations" ON public.destinations;
CREATE POLICY "Allow public select destinations" ON public.destinations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert destinations" ON public.destinations;
CREATE POLICY "Allow public insert destinations" ON public.destinations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update destinations" ON public.destinations;
CREATE POLICY "Allow public update destinations" ON public.destinations FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete destinations" ON public.destinations;
CREATE POLICY "Allow public delete destinations" ON public.destinations FOR DELETE USING (true);

INSERT INTO public.destinations (id, name, city, district, lat, lng, type, popular)
VALUES
    ('CIRAGAN', 'Çırağan Palace Kempinski', 'İstanbul', 'Beşiktaş', 41.0435, 29.0157, 'hotel', true),
    ('FOUR_SEASONS_BOSPHORUS', 'Four Seasons Hotel Bosphorus', 'İstanbul', 'Beşiktaş', 41.0478, 29.0195, 'hotel', true),
    ('MANDARIN_ORIENTAL', 'Mandarin Oriental Bosphorus', 'İstanbul', 'Kuruçeşme', 41.0601, 29.0345, 'hotel', true),
    ('RAFFLES_ISTANBUL', 'Raffles Istanbul (Zorlu Center)', 'İstanbul', 'Levazım / Beşiktaş', 41.0668, 29.0175, 'hotel', true),
    ('THE_PENINSULA', 'The Peninsula Istanbul', 'İstanbul', 'Karaköy', 41.0267, 28.9803, 'hotel', true),
    ('SWISSOTEL', 'Swissôtel The Bosphorus', 'İstanbul', 'Maçka / Beşiktaş', 41.0416, 29.0006, 'hotel', true),
    ('TAKSIM_SQUARE', 'Taksim Meydanı & Beyoğlu', 'İstanbul', 'Beyoğlu', 41.0370, 28.9850, 'district', true),
    ('SULTANAHMET_SQUARE', 'Sultanahmet & Tarihi Yarımada', 'İstanbul', 'Fatih', 41.0054, 28.9768, 'district', true),
    ('KADIKOY_MODA', 'Kadıköy Moda Sahili', 'İstanbul', 'Kadıköy', 40.9833, 29.0250, 'district', true),
    ('MAXX_ROYAL_BELEK', 'Maxx Royal Belek Golf Resort', 'Antalya', 'Belek', 36.8522, 31.0614, 'hotel', true),
    ('REGNUM_CARYA', 'Regnum Carya Golf & Spa', 'Antalya', 'Belek', 36.8703, 31.0182, 'hotel', true),
    ('YALIKAVAK_MARINA', 'Yalıkavak Marina Resort', 'Bodrum', 'Yalıkavak', 37.1062, 27.2917, 'marina', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, district = EXCLUDED.district;

-- 4. Filo Tablosu (Fleet)
CREATE TABLE IF NOT EXISTS public.fleet (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    category TEXT NOT NULL,
    seats INTEGER NOT NULL,
    luggage INTEGER NOT NULL,
    transmission TEXT NOT NULL,
    fuel_engine TEXT NOT NULL,
    base_opening_rate NUMERIC(10, 2) NOT NULL,
    base_rate_km NUMERIC(10, 2) NOT NULL,
    image_url TEXT NOT NULL,
    badge TEXT,
    badge_color TEXT,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.fleet ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select fleet" ON public.fleet;
CREATE POLICY "Allow public select fleet" ON public.fleet FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert fleet" ON public.fleet;
CREATE POLICY "Allow public insert fleet" ON public.fleet FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update fleet" ON public.fleet;
CREATE POLICY "Allow public update fleet" ON public.fleet FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete fleet" ON public.fleet;
CREATE POLICY "Allow public delete fleet" ON public.fleet FOR DELETE USING (true);

INSERT INTO public.fleet (id, name, class_name, category, badge, badge_color, seats, luggage, transmission, fuel_engine, base_opening_rate, base_rate_km, image_url, description, features)
VALUES
    ('vito-vip', 'Mercedes-Benz Vito VIP Lounge', 'VIP Minivan', 'vip-minivan', 'En Çok Tercih Edilen', 'gold', 6, 6, '9G-Tronic Otomatik', '2.0L BiTurbo 190 HP Dizel', 1200, 32, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', 'Yatar mekanizmalı hakiki deri koltuklar, Apple TV, 5G Wi-Fi, ara bölme ve Nespresso kahve ikramı.', '["Hakiki Deri Yatar VIP Koltuklar", "32\" Smart TV & Apple TV", "Elektrikli Ara Bölme", "5G Wi-Fi", "Nespresso Konsol"]'::jsonb),
    ('v-class-maybach', 'Mercedes-Benz V-Class Maybach Edition', 'Ultra VIP Minivan', 'ultra-vip', 'Özel Seri Maybach', 'amber', 4, 4, '9G-Tronic Otomatik', '3.0L V6 237 HP Dizel', 2000, 48, 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80', 'Maybach tavan aydınlatması, masajlı ve havalandırmalı first-class koltuklar ve starlight yıldız tavan.', '["Maybach Starlight Tavan", "Masajlı Koltuklar", "Burmester 3D Surround", "Şampanya Soğutucu", "PlayStation 5"]'::jsonb),
    ('s-class-maybach', 'Mercedes-Benz S-Class (S 400d / S 580)', 'First Class Sedan', 'ultra-vip', 'Makam & Protokol', 'gold', 3, 2, '9G-Tronic 4MATIC', '3.0L Inline-6 330 HP Dizel', 2500, 55, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80', 'Liderler ve iş insanları için sessiz konfor, arka multimedya tabletleri ve koku iyonizasyon sistemi.', '["Executive Yatar Sağ Koltuk", "MBUX Tabletleri", "Airmatic Süspansiyon", "Akustik Çift Cam"]'::jsonb),
    ('sprinter-vip', 'Mercedes-Benz Sprinter Jet Class', 'Geniş Heyet VIP', 'group-vip', 'Grup & Heyet', 'blue', 12, 14, '7G-Tronic Otomatik', '2.0L CDI 170 HP Dizel', 2200, 42, 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80', 'Büyük aileler ve kurumsal heyetler için geniş hacimli tavan yüksekliği ve konferans masası düzeni.', '["12 Deri Koltuk", "Çift 40\" TV Monitör", "Toplantı Masası", "Genişletilmiş Bagaj"]'::jsonb)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, base_opening_rate = EXCLUDED.base_opening_rate, base_rate_km = EXCLUDED.base_rate_km;

-- 5. Donanımlar & Özellikler (Amenities)
CREATE TABLE IF NOT EXISTS public.amenities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    price_try NUMERIC(10, 2) NOT NULL DEFAULT 0,
    is_free BOOLEAN DEFAULT FALSE,
    icon TEXT NOT NULL,
    has_count BOOLEAN DEFAULT FALSE,
    checked_by_default BOOLEAN DEFAULT FALSE,
    category TEXT DEFAULT 'comfort',
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select amenities" ON public.amenities;
CREATE POLICY "Allow public select amenities" ON public.amenities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert amenities" ON public.amenities;
CREATE POLICY "Allow public insert amenities" ON public.amenities FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update amenities" ON public.amenities;
CREATE POLICY "Allow public update amenities" ON public.amenities FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete amenities" ON public.amenities;
CREATE POLICY "Allow public delete amenities" ON public.amenities FOR DELETE USING (true);

INSERT INTO public.amenities (id, title, subtitle, price_try, is_free, icon, has_count, checked_by_default, category, is_visible)
VALUES
    ('baby-seat', 'Bebek / Çocuk Güvenlik Koltuğu', 'ECE R44/04 ve i-Size standartlarına uygun Isofix montajlı koltuk (0-36 kg).', 150, false, 'Baby', true, false, 'safety'),
    ('vip-meet-greet', 'Özel İsim Panosuyla VIP Karşılama', 'Gümrük kapısı çıkışında isimli tablet ile karşılama ve bagaj taşıma asistanlığı.', 0, true, 'UserCheck', false, true, 'service'),
    ('flight-tracking-guarantee', 'Canlı Radar Uçuş Takip Güvencesi', 'Uçağınız erken inse veya rötar yapsa dahi 60 dakika ücretsiz bekleme garantisi.', 0, true, 'Plane', false, true, 'guarantee'),
    ('wifi-multimedia', 'Sınırsız 5G Wi-Fi & Apple TV / Netflix', 'Yüksek hızlı internet bağlantısı ve araç içi yayın platformları erişimi.', 0, true, 'Wifi', false, true, 'multimedia'),
    ('minibar-premium', 'VIP Minibar & İkram Paketi', 'Soğuk meşrubatlar, taze sıkılmış meyve suları, San Pellegrino ve atıştırmalıklar.', 350, false, 'Wine', false, false, 'refreshment'),
    ('starlight-ceiling', 'Starlight Yıldız Tavan & Ambiyans Işığı', 'Rolls-Royce tarzı fiber optik gece yıldız tavanı ve 64 renk ambiyans aydınlatması.', 250, false, 'Sparkles', false, false, 'comfort'),
    ('multilingual-chauffeur', 'Yabancı Dil Bilen Protokol Şoförü', 'Akıcı İngilizce, Rusça veya Arapça konuşabilen takım elbiseli deneyimli şoför.', 300, false, 'Languages', false, false, 'chauffeur'),
    ('privacy-partition', 'Elektrikli Akustik Ara Bölme', 'Şoför mahalli ile yolcu kabinini tamamen ayıran ses geçirmez elektrikli cam bölme.', 200, false, 'Shield', false, false, 'privacy')
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title, price_try = EXCLUDED.price_try, subtitle = EXCLUDED.subtitle;

-- 6. Popüler Rotalar & Fiyatlar (Routes)
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    distance_km NUMERIC(6, 2) NOT NULL,
    duration_min INTEGER NOT NULL,
    vehicle TEXT NOT NULL DEFAULT 'Mercedes Vito VIP',
    price_try NUMERIC(10, 2) NOT NULL,
    badge TEXT DEFAULT 'En Popüler',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select routes" ON public.routes;
CREATE POLICY "Allow public select routes" ON public.routes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert routes" ON public.routes;
CREATE POLICY "Allow public insert routes" ON public.routes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update routes" ON public.routes;
CREATE POLICY "Allow public update routes" ON public.routes FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete routes" ON public.routes;
CREATE POLICY "Allow public delete routes" ON public.routes FOR DELETE USING (true);

INSERT INTO public.routes (from_location, to_location, distance_km, duration_min, vehicle, price_try, badge)
VALUES
    ('İstanbul Havalimanı (IST)', 'Çırağan Palace Kempinski', 42, 45, 'Mercedes Vito VIP', 1750, 'En Popüler'),
    ('İstanbul Havalimanı (IST)', 'Taksim Meydanı & Beyoğlu', 39, 40, 'Mercedes Vito VIP', 1650, 'Hızlı Transfer'),
    ('Sabiha Gökçen (SAW)', 'Kadıköy Moda Sahili', 34, 35, 'Mercedes Vito VIP', 1550, 'Anadolu Yakası'),
    ('Antalya Havalimanı (AYT)', 'Maxx Royal Belek', 36, 30, 'Mercedes V-Class VIP', 1950, 'Resort VIP'),
    ('Milas Bodrum (BJV)', 'Yalıkavak Marina Resort', 52, 50, 'Mercedes Maybach V-Class', 2600, 'Yat & Marina');

-- 7. Sıkça Sorulan Sorular (FAQs)
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select faqs" ON public.faqs;
CREATE POLICY "Allow public select faqs" ON public.faqs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert faqs" ON public.faqs;
CREATE POLICY "Allow public insert faqs" ON public.faqs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update faqs" ON public.faqs;
CREATE POLICY "Allow public update faqs" ON public.faqs FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete faqs" ON public.faqs;
CREATE POLICY "Allow public delete faqs" ON public.faqs FOR DELETE USING (true);

INSERT INTO public.faqs (question, answer, category, display_order)
VALUES
    ('Uçağım rötar yaparsa şoförüm beni bekler mi?', 'Evet. Rezervasyon sırasında girdiğiniz uçuş numarasını (Örn: TK1984) canlı radar sistemiyle anlık takip ediyoruz. Uçağınız 3 saat gecikse bile iniş yaptığınız anda şoförünüz kapıda hazır bulunur ve 60 dakikaya kadar ücretsiz bekler.', 'transfer', 1),
    ('Fiyatlara köprü, otoyol ve otopark ücretleri dahil mi?', 'Kesinlikle evet. SecureDrive platformunda gördüğünüz tüm fiyatlar %100 her şey dahil sabit fiyatlardır. Yolculuk sonunda köprü, Avrasya tüneli veya havalimanı otoparkı adı altında hiçbir ek ücret talep edilmez.', 'pricing', 2),
    ('Bebek koltuğu veya özel donanımları nasıl seçebilirim?', 'Rezervasyon sırasında Step 2 (Donanım & Özellikler) adımında dilediğiniz sayıda bebek koltuğu, minibar paketi, yıldız tavan veya yabancı dil bilen şoför gibi özellikleri seçebilirsiniz. Aracınız bu donanımlarla adınıza tahsis edilir.', 'amenities', 3),
    ('İptal ve değişiklik politikası nedir?', 'Transfer saatinize 24 saat kalana kadar koşulsuz ve %100 kesintisiz iptal veya tarih değişikliği yapabilirsiniz.', 'cancellation', 4);

-- 8. Şoförler (Drivers)
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Kıdemli VIP Protokol Şoförü',
    phone TEXT NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 4.97,
    transfers_count INTEGER DEFAULT 0,
    languages TEXT DEFAULT 'Türkçe, İngilizce',
    vehicle_plate TEXT DEFAULT '34 VIP 770',
    status TEXT NOT NULL DEFAULT 'on_duty',
    photo_url TEXT DEFAULT 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    app_user_id UUID REFERENCES public.app_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select drivers" ON public.drivers;
CREATE POLICY "Allow public select drivers" ON public.drivers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert drivers" ON public.drivers;
CREATE POLICY "Allow public insert drivers" ON public.drivers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update drivers" ON public.drivers;
CREATE POLICY "Allow public update drivers" ON public.drivers FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete drivers" ON public.drivers;
CREATE POLICY "Allow public delete drivers" ON public.drivers FOR DELETE USING (true);

-- 9. Rezervasyonlar (Bookings)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Rezervasyon Alındı — Şoför Bekleniyor',
    status_step INTEGER NOT NULL DEFAULT 1,
    passenger_name TEXT NOT NULL,
    passenger_phone TEXT NOT NULL,
    passenger_email TEXT,
    passenger_notes TEXT,
    flight_no TEXT DEFAULT 'TK 1984',
    pickup_location TEXT NOT NULL,
    destination_location TEXT NOT NULL,
    service_type TEXT NOT NULL DEFAULT 'transfer',
    trip_type TEXT NOT NULL DEFAULT 'oneway',
    transfer_datetime TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pax_count INTEGER NOT NULL DEFAULT 2,
    luggage_count INTEGER NOT NULL DEFAULT 2,
    vehicle_id TEXT NOT NULL,
    vehicle_name TEXT NOT NULL,
    vehicle_plate TEXT NOT NULL,
    chauffeur_name TEXT NOT NULL,
    chauffeur_phone TEXT NOT NULL,
    chauffeur_photo TEXT,
    amenities JSONB DEFAULT '[]'::jsonb,
    total_price_try NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'TRY',
    payment_method TEXT NOT NULL DEFAULT 'credit-card',
    payment_status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select bookings" ON public.bookings;
CREATE POLICY "Allow public select bookings" ON public.bookings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert bookings" ON public.bookings;
CREATE POLICY "Allow public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update bookings" ON public.bookings;
CREATE POLICY "Allow public update bookings" ON public.bookings FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete bookings" ON public.bookings;
CREATE POLICY "Allow public delete bookings" ON public.bookings FOR DELETE USING (true);

-- 10. Kurumsal Üyelik & Cari Hesap Başvuruları
CREATE TABLE IF NOT EXISTS public.corporate_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    tax_number TEXT,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    monthly_trips TEXT DEFAULT '10-25',
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    source TEXT NOT NULL DEFAULT 'kurumsal-page',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.corporate_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select corporate_applications" ON public.corporate_applications;
CREATE POLICY "Allow public select corporate_applications" ON public.corporate_applications FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert corporate_applications" ON public.corporate_applications;
CREATE POLICY "Allow public insert corporate_applications" ON public.corporate_applications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update corporate_applications" ON public.corporate_applications;
CREATE POLICY "Allow public update corporate_applications" ON public.corporate_applications FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete corporate_applications" ON public.corporate_applications;
CREATE POLICY "Allow public delete corporate_applications" ON public.corporate_applications FOR DELETE USING (true);

-- 11. Şoför Değerlendirme & Şikayetler
CREATE TABLE IF NOT EXISTS public.driver_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT UNIQUE NOT NULL,
    booking_id UUID,
    passenger_name TEXT NOT NULL,
    passenger_email TEXT,
    passenger_phone TEXT,
    chauffeur_name TEXT NOT NULL,
    chauffeur_phone TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_type TEXT NOT NULL DEFAULT 'praise',
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.driver_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select driver_reviews" ON public.driver_reviews;
CREATE POLICY "Allow public select driver_reviews" ON public.driver_reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert driver_reviews" ON public.driver_reviews;
CREATE POLICY "Allow public insert driver_reviews" ON public.driver_reviews FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update driver_reviews" ON public.driver_reviews;
CREATE POLICY "Allow public update driver_reviews" ON public.driver_reviews FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete driver_reviews" ON public.driver_reviews;
CREATE POLICY "Allow public delete driver_reviews" ON public.driver_reviews FOR DELETE USING (true);

-- 12. Bildirimler (Notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_role TEXT NOT NULL,
    recipient_user_id TEXT,
    recipient_email TEXT,
    recipient_phone TEXT,
    booking_code TEXT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_path TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select notifications" ON public.notifications;
CREATE POLICY "Allow public select notifications" ON public.notifications FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert notifications" ON public.notifications;
CREATE POLICY "Allow public insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update notifications" ON public.notifications;
CREATE POLICY "Allow public update notifications" ON public.notifications FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete notifications" ON public.notifications;
CREATE POLICY "Allow public delete notifications" ON public.notifications FOR DELETE USING (true);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_email ON public.notifications (recipient_email);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_phone ON public.notifications (recipient_phone);
CREATE INDEX IF NOT EXISTS idx_notifications_booking_code ON public.notifications (booking_code);

-- Realtime: anlık bildirim push
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
