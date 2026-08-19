import { mkdirSync } from "node:fs";
import "dotenv/config";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

function needsPgSsl(url: string) {
  return (
    process.env.NODE_ENV === "production" ||
    /render\.com|sslmode=require/i.test(url)
  );
}

const usePglite =
  databaseUrl === "pglite" || databaseUrl.startsWith("pglite:");

type AppDb =
  | ReturnType<typeof drizzlePglite>
  | ReturnType<typeof drizzlePg>;

function pglitePath() {
  if (databaseUrl === "pglite") return "./.data/monodiary";
  return databaseUrl.slice("pglite:".length) || "./.data/monodiary";
}

let db: AppDb;
let sql: postgres.Sql | { end: () => Promise<void> };

if (usePglite) {
  const dir = pglitePath();
  mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  db = drizzlePglite({ client, schema });
  sql = { end: async () => undefined };
  console.log(`DB ready (PGlite): ${dir}`);
} else {
  const connection = postgres(databaseUrl, {
    max: 10,
    ssl: needsPgSsl(databaseUrl) ? { rejectUnauthorized: false } : undefined,
  });
  db = drizzlePg(connection, { schema });
  sql = connection;
}

export { db, sql };
export const usingPglite = usePglite;
