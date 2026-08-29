-- Amenities: admin can show/hide options on the public booking site
ALTER TABLE public.amenities
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE public.amenities SET is_visible = TRUE WHERE is_visible IS NULL;
