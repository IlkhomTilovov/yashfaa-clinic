
-- handle_new_user is a trigger fn; it should not be callable by clients
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Public wrapper for the client to check its own admin status (SECURITY INVOKER, safe)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$ SELECT private.has_role(auth.uid(), 'admin'::app_role) $$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
