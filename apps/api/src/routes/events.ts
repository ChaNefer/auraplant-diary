import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { EventInputSchema } from "@monodiary/timeline-core";
import { db } from "../db/client.js";
import { entity, event } from "../db/schema.js";
import { badRequest, zodError } from "../lib/errors.js";
import { identityUserId, workspaceOwnedBy } from "../lib/owner.js";
import { applyTriage } from "../triage/engine.js";

export const eventsRoutes = new Hono();

eventsRoutes.post("/", async (c) => {
  const parsed = EventInputSchema.safeParse(await c.req.json());
  if (!parsed.success) return zodError(c, parsed.error);

  const ent = await db.query.entity.findFirst({
    where: eq(entity.id, parsed.data.entity_id),
  });
  if (!ent) return badRequest(c, "entity_not_found");
  if (!(await workspaceOwnedBy(ent.workspaceId, identityUserId(c)))) {
    return c.json({ error: "forbidden" }, 403);
  }

  const flags = applyTriage(
    parsed.data.type,
    parsed.data.payload,
    parsed.data.flags,
  );

  const [row] = await db
    .insert(event)
    .values({
      entityId: parsed.data.entity_id,
      workspaceId: ent.workspaceId,
      ts: new Date(parsed.data.ts),
      type: parsed.data.type,
      source: parsed.data.source,
      payload: parsed.data.payload,
      flags,
      schemaVersion: parsed.data.schema_version,
    })
    .returning();

  return c.json(
    {
      id: row.id,
      entity_id: row.entityId,
      workspace_id: row.workspaceId,
      ts: row.ts.toISOString(),
      type: row.type,
      source: row.source,
      payload: row.payload,
      flags: row.flags,
      schema_version: row.schemaVersion,
      created_at: row.createdAt.toISOString(),
    },
    201,
  );
});
