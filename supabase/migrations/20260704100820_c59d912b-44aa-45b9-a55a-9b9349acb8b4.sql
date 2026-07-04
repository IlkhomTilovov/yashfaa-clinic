
GRANT SELECT (
  id, name, name_uz, name_ru,
  specialization, specialization_uz, specialization_ru,
  image_url, bio, bio_uz, bio_ru,
  created_at, experience_years, is_active, branch,
  schedule, consultation_price, languages, services_offered,
  slug, online_available
) ON public.doctors TO anon, authenticated;
GRANT SELECT (phone) ON public.doctors TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.doctors TO authenticated;
GRANT ALL ON public.doctors TO service_role;
