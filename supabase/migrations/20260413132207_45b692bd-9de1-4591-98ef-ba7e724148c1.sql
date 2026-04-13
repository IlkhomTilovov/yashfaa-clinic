
-- 1. Fix has_role to only allow checking caller's own roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = _role
  )
$$;

-- 2. Remove appointments from realtime publication to prevent data leak
ALTER PUBLICATION supabase_realtime DROP TABLE public.appointments;

-- 3. Replace overly permissive INSERT policy on appointments
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;
CREATE POLICY "Anyone can create appointments"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (
  patient_name <> '' AND
  phone <> '' AND
  service <> '' AND
  date IS NOT NULL AND
  time <> ''
);
