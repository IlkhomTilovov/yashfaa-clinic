
-- Add slug column to services table
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Generate slugs from existing service names
UPDATE public.services 
SET slug = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(name, '[''ʼ]', '', 'g'),
      '[^a-zA-Z0-9\s-]', '', 'g'
    ),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL;
