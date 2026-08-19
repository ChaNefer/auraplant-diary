import { mkdirSync } from "node:fs";
import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../../drizzle");

const usePglite =
  databaseUrl === "pglite" || databaseUrl.startsWith("pglite:");

if (usePglite) {
  const dir =
    databaseUrl === "pglite"
      ? "./.data/monodiary"
      : databaseUrl.slice("pglite:".length) || "./.data/monodiary";
  mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  const db = drizzlePglite({ client });
  await migratePglite(db, { migrationsFolder });
  console.log("Migrations applied (PGlite).");
  await client.close();
} else {
  const connection = postgres(databaseUrl, { max: 1 });
  const db = drizzle(connection);
  await migrate(db, { migrationsFolder });
  console.log("Migrations applied.");
  await connection.end();
}
