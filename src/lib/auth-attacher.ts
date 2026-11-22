// Attaches the admin session token to every server-function RPC call, so
// server-side middleware (e.g. requireAdmin) can identify the caller. Safe
// on public, unauthenticated calls too — with no token it just sends no
// Authorization header. Must be registered as a global `functionMiddleware`
// in `src/start.ts`.
import { createMiddleware } from "@tanstack/react-start";
import { getStoredToken } from "@/lib/auth/client-token";

export const attachAuthToken = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const token = getStoredToken();
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
