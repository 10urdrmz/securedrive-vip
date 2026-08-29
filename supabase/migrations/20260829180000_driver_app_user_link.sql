-- Şoför ↔ app_users bağlantısı
ALTER TABLE public.drivers
ADD COLUMN IF NOT EXISTS app_user_id UUID REFERENCES public.app_users(id);

CREATE INDEX IF NOT EXISTS idx_drivers_app_user_id ON public.drivers(app_user_id);
d