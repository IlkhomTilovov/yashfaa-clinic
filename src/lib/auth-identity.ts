// Shared helper: resolve the caller's admin user id from the
// `Authorization: Bearer <token>` header attached by attachAuthToken.
// Used by both `requireAdmin` (throws) and `checkIsAdmin` (returns a
// boolean) so the verification logic lives once.
import { getSessionUserId } from "@/lib/auth/session";

export async function getUserIdFromAuthHeader(authHeader: string | null | undefined): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length);
  if (!token) return null;
  return getSessionUserId(token);
}
