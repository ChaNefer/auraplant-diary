import { Hono } from "hono";
import { sql } from "./db/client.js";
import { entitiesRoutes } from "./routes/entities.js";
import { eventsRoutes } from "./routes/events.js";
import { workspacesRoutes } from "./routes/workspaces.js";

export const app = new Hono();

app.get("/health", async (c) => {
  await sql`select 1`;
  return c.json({ ok: true, service: "monodiary-api" });
});

app.route("/workspaces", workspacesRoutes);
app.route("/entities", entitiesRoutes);
app.route("/events", eventsRoutes);
