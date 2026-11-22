// DB-backed admin sessions — replaces Supabase Auth's JWT session. The
// session row's own id IS the bearer token; looking it up (and checking
// expiry) is the entire verification step, and deleting it is logout.
import { eq, gt, and } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { adminSessions } from "@/lib/db/schema";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createSession(userId: string): Promise<string> {
  const db = await getDb();
  const expires_at = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const [row] = await db
    .insert(adminSessions)
    .values({ user_id: userId, expires_at })
    .returning({ id: adminSessions.id });
  return row.id;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getSessionUserId(token: string): Promise<string | null> {
  // Guards against malformed tokens (e.g. a stale pre-migration Supabase JWT
  // still sitting in a browser's localStorage) hitting the uuid column and
  // throwing a Postgres type error instead of just "not a session".
  if (!UUID_RE.test(token)) return null;
  const db = await getDb();
  const session = await db.query.adminSessions.findFirst({
    columns: { user_id: true },
    where: and(eq(adminSessions.id, token), gt(adminSessions.expires_at, new Date().toISOString())),
  });
  return session?.user_id ?? null;
}

export async function deleteSession(token: string): Promise<void> {
  const db = await getDb();
  await db.delete(adminSessions).where(eq(adminSessions.id, token));
}
