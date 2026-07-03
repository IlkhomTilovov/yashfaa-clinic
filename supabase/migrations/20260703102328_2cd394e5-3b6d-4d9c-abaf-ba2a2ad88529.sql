
-- 1. Move has_role to private schema so PostgREST does not expose it
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

-- 2. Recreate all policies that referenced public.has_role to use private.has_role
-- category_types
DROP POLICY IF EXISTS "Admins can delete category types" ON public.category_types;
DROP POLICY IF EXISTS "Admins can insert category types" ON public.category_types;
DROP POLICY IF EXISTS "Admins can update category types" ON public.category_types;
CREATE POLICY "Admins can delete category types" ON public.category_types FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert category types" ON public.category_types FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update category types" ON public.category_types FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

-- services
DROP POLICY IF EXISTS "Admins can delete services" ON public.services;
DROP POLICY IF EXISTS "Admins can insert services" ON public.services;
DROP POLICY IF EXISTS "Admins can update services" ON public.services;
CREATE POLICY "Admins can delete services" ON public.services FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert services" ON public.services FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

-- clinic_settings
DROP POLICY IF EXISTS "Admins can insert settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.clinic_settings;
CREATE POLICY "Admins can insert settings" ON public.clinic_settings FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update settings" ON public.clinic_settings FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

-- site_content
DROP POLICY IF EXISTS "Admins can delete site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can insert site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can update site content" ON public.site_content;
CREATE POLICY "Admins can delete site content" ON public.site_content FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert site content" ON public.site_content FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update site content" ON public.site_content FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

-- tests
DROP POLICY IF EXISTS "Admins can delete tests" ON public.tests;
DROP POLICY IF EXISTS "Admins can insert tests" ON public.tests;
DROP POLICY IF EXISTS "Admins can update tests" ON public.tests;
CREATE POLICY "Admins can delete tests" ON public.tests FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert tests" ON public.tests FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update tests" ON public.tests FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

-- categories
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

-- user_roles: existing SELECT + new INSERT/UPDATE/DELETE policies (admin only)
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

-- doctors
DROP POLICY IF EXISTS "Admins can delete doctors" ON public.doctors;
DROP POLICY IF EXISTS "Admins can insert doctors" ON public.doctors;
DROP POLICY IF EXISTS "Admins can update doctors" ON public.doctors;
CREATE POLICY "Admins can delete doctors" ON public.doctors FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert doctors" ON public.doctors FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update doctors" ON public.doctors FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

-- appointments
DROP POLICY IF EXISTS "Admins can delete appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can view all appointments" ON public.appointments;
CREATE POLICY "Admins can delete appointments" ON public.appointments FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update appointments" ON public.appointments FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all appointments" ON public.appointments FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

-- storage.objects: rebuild admin write policies using private.has_role, and drop the broad public SELECT policies (buckets remain public, direct URL access still works)
DROP POLICY IF EXISTS "Admins can delete doctor images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete site images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update doctor images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update site images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload doctor images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload site images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view doctor images" ON storage.objects;
DROP POLICY IF EXISTS "Site images are publicly accessible" ON storage.objects;

CREATE POLICY "Admins can delete doctor images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'doctor-images' AND private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete site images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-images' AND private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update doctor images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'doctor-images' AND private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update site images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-images' AND private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can upload doctor images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'doctor-images' AND private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can upload site images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-images' AND private.has_role(auth.uid(), 'admin'::app_role));

-- 3. Drop the old public.has_role now that nothing references it
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 4. Column-level restriction: hide doctors.phone from anon and authenticated (admins still see via service role / API updates go through admin flow)
REVOKE SELECT ON public.doctors FROM anon, authenticated;
GRANT SELECT (
  id, name, name_uz, name_ru,
  specialization, specialization_uz, specialization_ru,
  image_url, bio, bio_uz, bio_ru,
  created_at, experience_years, is_active, branch,
  schedule, consultation_price, languages, services_offered,
  slug, online_available
) ON public.doctors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.doctors TO authenticated;
GRANT ALL ON public.doctors TO service_role;
