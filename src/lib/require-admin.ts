// Server-function middleware that gates admin-only server functions.
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { getUserIdFromAuthHeader } from "@/lib/auth-identity";
import { getDb } from "@/lib/db/client";
import { userRoles } from "@/lib/db/schema";

export const requireAdmin = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    const userId = await getUserIdFromAuthHeader(request?.headers?.get("authorization"));
    if (!userId) {
      throw new Response("Unauthorized: Invalid or missing token", { status: 401 });
    }

    const db = await getDb();
    const adminRole = await db.query.userRoles.findFirst({
      where: and(eq(userRoles.user_id, userId), eq(userRoles.role, "admin")),
    });
    if (!adminRole) {
      throw new Response("Forbidden: Admin role required", { status: 403 });
    }

    return next({ context: { userId } });
  }
);
