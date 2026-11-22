// Public server function used by useAuth() to determine admin status for
// client-side UI gating (sidebar, EditableText/EditableImage controls).
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { getUserIdFromAuthHeader } from "@/lib/auth-identity";
import { getDb } from "@/lib/db/client";
import { userRoles } from "@/lib/db/schema";

export const checkIsAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const userId = await getUserIdFromAuthHeader(request?.headers?.get("authorization"));
  if (!userId) return false;

  const db = await getDb();
  const adminRole = await db.query.userRoles.findFirst({
    where: and(eq(userRoles.user_id, userId), eq(userRoles.role, "admin")),
  });
  return !!adminRole;
});
