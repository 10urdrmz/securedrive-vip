-- Bildirimler tablosu
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

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_email ON public.notifications (recipient_email);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_phone ON public.notifications (recipient_phone);
CREATE INDEX IF NOT EXISTS idx_notifications_booking_code ON public.notifications (booking_code);

-- Yeni rezervasyonlar: önce şoför bekleniyor (adım 1)
ALTER TABLE public.bookings ALTER COLUMN status SET DEFAULT 'Rezervasyon Alındı — Şoför Bekleniyor';
ALTER TABLE public.bookings ALTER COLUMN status_step SET DEFAULT 1;
