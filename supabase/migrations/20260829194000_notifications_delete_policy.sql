-- Bildirim silme (tümünü temizle)
DROP POLICY IF EXISTS "Allow public delete notifications" ON public.notifications;
CREATE POLICY "Allow public delete notifications" ON public.notifications FOR DELETE USING (true);
