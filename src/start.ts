import { createStart } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

// Attaches the Supabase session's bearer token to every server-function RPC
// call, so server-side middleware (e.g. requireAdmin) can identify the
// caller. Safe on public, unauthenticated calls too — with no session it
// just sends no Authorization header.
export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
}));
