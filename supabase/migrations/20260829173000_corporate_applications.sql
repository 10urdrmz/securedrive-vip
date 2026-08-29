-- Kurumsal başvuru tablosu + RLS (Supabase SQL Editor'da çalıştırın)
-- Tablo zaten varsa yalnızca policy kısmı da yeterlidir.

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
CREATE POLICY "Allow public select corporate_applications"
    ON public.corporate_applications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert corporate_applications" ON public.corporate_applications;
CREATE POLICY "Allow public insert corporate_applications"
    ON public.corporate_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update corporate_applications" ON public.corporate_applications;
CREATE POLICY "Allow public update corporate_applications"
    ON public.corporate_applications FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete corporate_applications" ON public.corporate_applications;
CREATE POLICY "Allow public delete corporate_applications"
    ON public.corporate_applications FOR DELETE USING (true);
