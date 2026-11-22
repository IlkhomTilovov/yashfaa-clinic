// Bootstrap (or reset) an admin account directly against the database.
// Replaces the public self-signup page (`/admin/setup`) — creating admins
// over an unauthenticated HTTP endpoint was never great, and now that Auth
// isn't Supabase's problem anymore, there is no reason to keep it public.
//
// Usage: DATABASE_URL=... bun run scripts/create-admin.ts <email> <password>
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { randomUUID, randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import { pgTable, uuid, text, timestamp, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";

const scrypt = promisify(scryptCb);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

// Minimal inline table defs (not importing src/lib/db/schema.ts — this
// script runs standalone via `bun run`, outside the Vite/tsconfig-paths
// resolution the app's "@/" alias relies on).
const appRoleEnum = pgEnum("app_role", ["admin", "user"]);
const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  password_hash: text("password_hash").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => ({
  emailUnique: uniqueIndex("admin_users_email_key").on(table.email),
}));
const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  role: appRoleEnum("role").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error("Usage: bun run scripts/create-admin.ts <email> <password>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required (e.g. postgres://user:pass@host:5433/yashfaa)");
  }

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  const normalizedEmail = email.toLowerCase().trim();
  const password_hash = await hashPassword(password);

  const existing = (
    await db.select().from(adminUsers).where(eq(adminUsers.email, normalizedEmail))
  )[0];

  let userId: string;
  if (existing) {
    userId = existing.id;
    await db.update(adminUsers).set({ password_hash }).where(eq(adminUsers.id, userId));
    console.log(`Updated password for existing admin ${normalizedEmail}.`);
  } else {
    userId = randomUUID();
    await db.insert(adminUsers).values({ id: userId, email: normalizedEmail, password_hash });
    console.log(`Created admin ${normalizedEmail}.`);
  }

  const existingRole = (
    await db.select().from(userRoles).where(eq(userRoles.user_id, userId))
  ).find((r) => r.role === "admin");
  if (!existingRole) {
    await db.insert(userRoles).values({ user_id: userId, role: "admin" });
    console.log("Granted admin role.");
  }

  await sql.end();
  console.log("Done. Log in at /admin/login with this email and password.");
}

await main();
