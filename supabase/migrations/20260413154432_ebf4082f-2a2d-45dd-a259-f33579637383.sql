
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS duration text,
  ADD COLUMN IF NOT EXISTS location_type text,
  ADD COLUMN IF NOT EXISTS preparation_requirements text,
  ADD COLUMN IF NOT EXISTS result_info text,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_online boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS doctor_ids uuid[] DEFAULT '{}';
