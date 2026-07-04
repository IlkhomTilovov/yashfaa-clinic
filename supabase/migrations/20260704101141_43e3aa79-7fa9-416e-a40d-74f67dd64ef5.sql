
-- Remove phone read for both anon and authenticated (admin panel will use a security-definer RPC)
REVOKE SELECT (phone) ON public.doctors FROM anon, authenticated;

-- Admin-only fetcher: returns full doctor rows including phone; checks role inside the function
CREATE OR REPLACE FUNCTION public.admin_get_doctors()
RETURNS SETOF public.doctors
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT private.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT * FROM public.doctors ORDER BY name;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_get_doctors() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_doctors() TO authenticated;
