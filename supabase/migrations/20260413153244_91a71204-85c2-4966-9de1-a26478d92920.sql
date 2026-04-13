
ALTER TABLE public.tests
  ADD COLUMN IF NOT EXISTS preparation_requirements text,
  ADD COLUMN IF NOT EXISTS result_time text,
  ADD COLUMN IF NOT EXISTS biomaterial_type text,
  ADD COLUMN IF NOT EXISTS is_recommended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_urgent boolean NOT NULL DEFAULT false;
