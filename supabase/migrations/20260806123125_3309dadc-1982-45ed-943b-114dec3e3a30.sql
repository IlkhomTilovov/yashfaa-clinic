CREATE OR REPLACE FUNCTION private.admin_get_doctors()
RETURNS SETOF public.doctors
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR NOT private.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT * FROM public.doctors ORDER BY name;
END;
$function$;

REVOKE EXECUTE ON FUNCTION private.admin_get_doctors() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.admin_get_doctors() TO authenticated, service_role;

DROP FUNCTION IF EXISTS public.admin_get_doctors();

CREATE OR REPLACE FUNCTION public.admin_get_doctors()
RETURNS SETOF public.doctors
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT * FROM private.admin_get_doctors();
$function$;

REVOKE EXECUTE ON FUNCTION public.admin_get_doctors() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_doctors() TO authenticated, service_role;