
-- Services: add multilingual columns
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS name_uz text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS name_ru text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS description_uz text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS description_ru text;

-- Migrate existing data to _uz
UPDATE public.services SET name_uz = name WHERE name_uz IS NULL;
UPDATE public.services SET description_uz = description WHERE description_uz IS NULL;

-- Doctors: add multilingual columns
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS name_uz text;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS name_ru text;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS specialization_uz text;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS specialization_ru text;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS bio_uz text;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS bio_ru text;

-- Migrate existing data to _uz
UPDATE public.doctors SET name_uz = name WHERE name_uz IS NULL;
UPDATE public.doctors SET specialization_uz = specialization WHERE specialization_uz IS NULL;
UPDATE public.doctors SET bio_uz = bio WHERE bio_uz IS NULL;

-- Tests: add multilingual columns
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS name_uz text;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS name_ru text;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS description_uz text;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS description_ru text;

-- Migrate existing data to _uz
UPDATE public.tests SET name_uz = name WHERE name_uz IS NULL;
UPDATE public.tests SET description_uz = description WHERE description_uz IS NULL;

-- Categories: add multilingual columns
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name_uz text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name_ru text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description_uz text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description_ru text;

-- Migrate existing data to _uz
UPDATE public.categories SET name_uz = name WHERE name_uz IS NULL;
UPDATE public.categories SET description_uz = description WHERE description_uz IS NULL;

-- Category Types: add multilingual columns
ALTER TABLE public.category_types ADD COLUMN IF NOT EXISTS name_uz text;
ALTER TABLE public.category_types ADD COLUMN IF NOT EXISTS name_ru text;

-- Migrate existing data to _uz
UPDATE public.category_types SET name_uz = name WHERE name_uz IS NULL;
