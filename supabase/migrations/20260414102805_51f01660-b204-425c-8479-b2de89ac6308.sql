
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS preparation_requirements_uz text,
  ADD COLUMN IF NOT EXISTS preparation_requirements_ru text,
  ADD COLUMN IF NOT EXISTS result_info_uz text,
  ADD COLUMN IF NOT EXISTS result_info_ru text;

UPDATE public.services SET
  preparation_requirements_uz = COALESCE(preparation_requirements_uz, preparation_requirements),
  result_info_uz = COALESCE(result_info_uz, result_info)
WHERE preparation_requirements_uz IS NULL OR result_info_uz IS NULL;
