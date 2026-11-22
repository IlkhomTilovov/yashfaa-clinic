// Server-only Postgres (Drizzle) client — replaces the Supabase DB connection.
// Connects to the self-hosted VPS Postgres instance via `DATABASE_URL`
// (set in .env for local dev, or as a Cloudflare Worker secret/plaintext var
// in production — nodejs_compat surfaces Worker vars through process.env,
// same as SUPABASE_URL elsewhere in this codebase).
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

function getDb() {
  if (_db) return _db;
  if (!process.env.DATABASE_URL) {
    throw new Error("Missing database connection. Set the DATABASE_URL environment variable.");
  }
  const sqlClient = postgres(process.env.DATABASE_URL, { max: 5, fetch_types: false });
  _db = drizzle(sqlClient, { schema });
  return _db;
}

export { getDb };
export type Db = ReturnType<typeof getDb>;
