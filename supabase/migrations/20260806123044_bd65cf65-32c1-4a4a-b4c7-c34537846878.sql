-- Internal role helper: only signed-in users need it (RLS admin policies are TO authenticated)
REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM anon, PUBLIC;

-- Admin doctors listing: security definer is required to read the restricted phone column,
-- but harden it with an explicit authenticated + admin check and no public execute.
REVOKE EXECUTE ON FUNCTION public.admin_get_doctors() FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.admin_get_doctors()
RETURNS SETOF public.doctors
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = '42501';
  END IF;
  IF NOT private.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT * FROM public.doctors ORDER BY name;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.admin_get_doctors() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_doctors() TO authenticated, service_role;

-- Ensure the phone column stays hidden from direct table reads
REVOKE SELECT (phone) ON public.doctors FROM anon, authenticated;