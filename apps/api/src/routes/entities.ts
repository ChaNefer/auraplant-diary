import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { Hono } from "hono";
import {
  CreateEntitySchema,
  TimelineQuerySchema,
  TransferEntitySchema,
} from "@monodiary/timeline-core";
import { db } from "../db/client.js";
import { entity, entityWorkspaceMove, event, workspace } from "../db/schema.js";
import { identityUserId, ownedWorkspaceIds, workspaceOwnedBy } from "../lib/owner.js";
import { badRequest, notFound, zodError } from "../lib/errors.js";

export const entitiesRoutes = new Hono();

entitiesRoutes.get("/", async (c) => {
  const userId = identityUserId(c);
  const rows = await db.query.entity.findMany({
    orderBy: [asc(entity.createdAt)],
  });
  if (!userId) return c.json(rows.map(serializeEntity));
  const allowed = await ownedWorkspaceIds(userId);
  return c.json(
    rows.filter((r) => allowed.has(r.workspaceId)).map(serializeEntity),
  );
});

entitiesRoutes.post("/", async (c) => {
  const parsed = CreateEntitySchema.safeParse(await c.req.json());
  if (!parsed.success) return zodError(c, parsed.error);

  const ws = await db.query.workspace.findFirst({
    where: eq(workspace.id, parsed.data.workspace_id),
  });
  if (!ws) return badRequest(c, "workspace_not_found");
  if (!(await workspaceOwnedBy(ws.id, identityUserId(c)))) {
    return c.json({ error: "forbidden" }, 403);
  }

  const [row] = await db
    .insert(entity)
    .values({
      workspaceId: parsed.data.workspace_id,
      displayName: parsed.data.display_name,
      externalKey: parsed.data.external_key ?? null,
    })
    .returning();

  return c.json(serializeEntity(row), 201);
});

entitiesRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const row = await db.query.entity.findFirst({
    where: eq(entity.id, id),
  });
  if (!row) return notFound(c, "entity_not_found");
  if (!(await workspaceOwnedBy(row.workspaceId, identityUserId(c)))) {
    return notFound(c, "entity_not_found");
  }
  return c.json(serializeEntity(row));
});

entitiesRoutes.post("/:id/transfer", async (c) => {
  const id = c.req.param("id");
  const parsed = TransferEntitySchema.safeParse(await c.req.json());
  if (!parsed.success) return zodError(c, parsed.error);

  const existing = await db.query.entity.findFirst({
    where: eq(entity.id, id),
  });
  if (!existing) return notFound(c, "entity_not_found");
  if (!(await workspaceOwnedBy(existing.workspaceId, identityUserId(c)))) {
    return notFound(c, "entity_not_found");
  }

  const target = await db.query.workspace.findFirst({
    where: eq(workspace.id, parsed.data.to_workspace_id),
  });
  if (!target) return badRequest(c, "to_workspace_not_found");
  if (!(await workspaceOwnedBy(target.id, identityUserId(c)))) {
    return c.json({ error: "forbidden" }, 403);
  }

  if (existing.workspaceId === parsed.data.to_workspace_id) {
    return badRequest(c, "already_in_workspace");
  }

  const result = await db.transaction(async (tx) => {
    const [moved] = await tx
      .update(entity)
      .set({ workspaceId: parsed.data.to_workspace_id })
      .where(eq(entity.id, id))
      .returning();

    const [audit] = await tx
      .insert(entityWorkspaceMove)
      .values({
        entityId: id,
        fromWorkspace: existing.workspaceId,
        toWorkspace: parsed.data.to_workspace_id,
        reason: parsed.data.reason ?? null,
      })
      .returning();

    return { moved, audit };
  });

  return c.json({
    entity: serializeEntity(result.moved),
    move: {
      id: result.audit.id,
      entity_id: result.audit.entityId,
      from_workspace: result.audit.fromWorkspace,
      to_workspace: result.audit.toWorkspace,
      moved_at: result.audit.movedAt.toISOString(),
      reason: result.audit.reason,
    },
  });
});

entitiesRoutes.get("/:id/timeline", async (c) => {
  const id = c.req.param("id");
  const existing = await db.query.entity.findFirst({
    where: eq(entity.id, id),
  });
  if (!existing) return notFound(c, "entity_not_found");
  if (!(await workspaceOwnedBy(existing.workspaceId, identityUserId(c)))) {
    return notFound(c, "entity_not_found");
  }

  const query = TimelineQuerySchema.safeParse({
    from: c.req.query("from"),
    to: c.req.query("to"),
    type: c.req.query("type"),
    flag: c.req.query("flag"),
  });
  if (!query.success) return zodError(c, query.error);

  const conditions = [eq(event.entityId, id)];
  if (query.data.from) {
    conditions.push(gte(event.ts, new Date(query.data.from)));
  }
  if (query.data.to) {
    conditions.push(lte(event.ts, new Date(query.data.to)));
  }
  if (query.data.type) {
    conditions.push(eq(event.type, query.data.type));
  }
  if (query.data.flag) {
    conditions.push(sql`${query.data.flag} = ANY(${event.flags})`);
  }

  const rows = await db
    .select()
    .from(event)
    .where(and(...conditions))
    .orderBy(asc(event.ts));

  return c.json(
    rows.map((row) => ({
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
    })),
  );
});

function serializeEntity(row: typeof entity.$inferSelect) {
  return {
    id: row.id,
    workspace_id: row.workspaceId,
    external_key: row.externalKey,
    display_name: row.displayName,
    created_at: row.createdAt.toISOString(),
  };
}
