
ALTER TABLE public.tests
  ADD COLUMN IF NOT EXISTS preparation_requirements_uz text,
  ADD COLUMN IF NOT EXISTS preparation_requirements_ru text;

UPDATE public.tests SET
  preparation_requirements_uz = COALESCE(preparation_requirements_uz, preparation_requirements)
WHERE preparation_requirements_uz IS NULL;
