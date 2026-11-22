// Login/logout/identity server functions — replaces Supabase Auth's
// signInWithPassword/signOut/getSession.
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { getUserIdFromAuthHeader } from "@/lib/auth-identity";

export const login = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; password: string }) =>
    z.object({ email: z.string().email(), password: z.string().min(1) }).parse(input)
  )
  .handler(async ({ data }) => {
    const db = await getDb();
    const user = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, data.email.toLowerCase().trim()),
    });
    const ok = user ? await verifyPassword(data.password, user.password_hash) : false;
    if (!user || !ok) {
      return { success: false as const };
    }
    const token = await createSession(user.id);
    return { success: true as const, token, email: user.email };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (token) await deleteSession(token);
  return { success: true };
});

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const userId = await getUserIdFromAuthHeader(request?.headers?.get("authorization"));
  if (!userId) return null;
  const db = await getDb();
  const user = await db.query.adminUsers.findFirst({
    columns: { id: true, email: true },
    where: eq(adminUsers.id, userId),
  });
  return user ?? null;
});
