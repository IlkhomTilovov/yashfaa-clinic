
-- Add new columns to doctors
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS experience_years integer;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Add new columns to tests
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Add type to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'others';

-- Add status and notes to appointments
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS notes text;

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric DEFAULT 0,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are publicly readable" ON public.services
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can insert services" ON public.services
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update services" ON public.services
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete services" ON public.services
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Create clinic_settings table (single row)
CREATE TABLE IF NOT EXISTS public.clinic_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name text NOT NULL DEFAULT 'Yashfaa Clinic',
  logo_url text,
  phone text DEFAULT '+998 71 123 45 67',
  address text DEFAULT 'Toshkent, O''zbekiston',
  telegram text,
  working_hours text DEFAULT 'Dush-Shan: 8:00-20:00',
  instagram text,
  facebook text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are publicly readable" ON public.clinic_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can update settings" ON public.clinic_settings
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert settings" ON public.clinic_settings
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default clinic settings row
INSERT INTO public.clinic_settings (clinic_name, phone, address, working_hours)
VALUES ('Yashfaa Clinic', '+998 71 123 45 67', 'Toshkent, O''zbekiston', 'Dush-Shan: 8:00-20:00');

-- Add UPDATE policy for appointments (was missing)
CREATE POLICY "Admins can update appointments" ON public.appointments
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
