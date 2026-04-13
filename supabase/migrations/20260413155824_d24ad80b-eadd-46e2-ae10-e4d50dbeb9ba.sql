
-- Add slug column to tests table
ALTER TABLE public.tests ADD COLUMN slug text UNIQUE;

-- Generate slugs for existing tests (transliterate basic Uzbek/Cyrillic)
UPDATE public.tests SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        name,
        ' ', '-'), '''', ''), '(', ''), ')', ''), ',', ''), '.', ''), '/', '-'), '\', '-'), '"', ''), '«', ''
      ),
      '[^a-zA-Z0-9а-яА-ЯёЁўЎқҚғҒҳҲ\-]', '', 'g'
    ),
    '-+', '-', 'g'
  )
) WHERE slug IS NULL;
