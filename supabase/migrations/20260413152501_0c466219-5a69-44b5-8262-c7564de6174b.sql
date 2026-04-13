
ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS branch text,
  ADD COLUMN IF NOT EXISTS schedule text,
  ADD COLUMN IF NOT EXISTS consultation_price numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS services_offered text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS online_available boolean NOT NULL DEFAULT false;
