import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../../drizzle");

const connection = postgres(databaseUrl, { max: 1 });
const db = drizzle(connection);

await migrate(db, { migrationsFolder });
console.log("Migrations applied.");
await connection.end();
