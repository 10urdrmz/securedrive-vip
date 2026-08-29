-- Şoför değerlendirme & şikayet tablosu (Supabase SQL Editor'da çalıştırın)

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
CREATE POLICY "Allow public select driver_reviews"
    ON public.driver_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert driver_reviews" ON public.driver_reviews;
CREATE POLICY "Allow public insert driver_reviews"
    ON public.driver_reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update driver_reviews" ON public.driver_reviews;
CREATE POLICY "Allow public update driver_reviews"
    ON public.driver_reviews FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete driver_reviews" ON public.driver_reviews;
CREATE POLICY "Allow public delete driver_reviews"
    ON public.driver_reviews FOR DELETE USING (true);
