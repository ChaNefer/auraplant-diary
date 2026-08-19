import { and, eq, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { CreateWorkspaceSchema } from "@monodiary/timeline-core";
import { db } from "../db/client.js";
import { workspace } from "../db/schema.js";
import { identityUserId, workspaceOwnedBy } from "../lib/owner.js";
import { badRequest, notFound, zodError } from "../lib/errors.js";

export const workspacesRoutes = new Hono();

workspacesRoutes.post("/", async (c) => {
  const parsed = CreateWorkspaceSchema.safeParse(await c.req.json());
  if (!parsed.success) return zodError(c, parsed.error);

  const { parent_id, slug, name, kind } = parsed.data;
  const userId = identityUserId(c);

  let ownerId = userId;
  if (parent_id) {
    const parent = await db.query.workspace.findFirst({
      where: eq(workspace.id, parent_id),
    });
    if (!parent) return badRequest(c, "parent_not_found");
    if (!(await workspaceOwnedBy(parent_id, userId))) {
      return c.json({ error: "forbidden" }, 403);
    }
    ownerId = parent.ownerId ?? userId;
  }

  const [row] = await db
    .insert(workspace)
    .values({
      parentId: parent_id ?? null,
      slug,
      name,
      kind,
      ownerId,
    })
    .returning();

  return c.json(serializeWorkspace(row), 201);
});

workspacesRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const row = await db.query.workspace.findFirst({
    where: eq(workspace.id, id),
  });
  if (!row) return notFound(c, "workspace_not_found");
  if (!(await workspaceOwnedBy(id, identityUserId(c)))) {
    return notFound(c, "workspace_not_found");
  }
  return c.json(serializeWorkspace(row));
});

workspacesRoutes.get("/:id/children", async (c) => {
  const id = c.req.param("id");
  const parent = await db.query.workspace.findFirst({
    where: eq(workspace.id, id),
  });
  if (!parent) return notFound(c, "workspace_not_found");
  if (!(await workspaceOwnedBy(id, identityUserId(c)))) {
    return notFound(c, "workspace_not_found");
  }

  const children = await db.query.workspace.findMany({
    where: eq(workspace.parentId, id),
  });
  return c.json(children.map(serializeWorkspace));
});

workspacesRoutes.get("/:id/breadcrumbs", async (c) => {
  const id = c.req.param("id");
  if (!(await workspaceOwnedBy(id, identityUserId(c)))) {
    return notFound(c, "workspace_not_found");
  }
  const chain: ReturnType<typeof serializeWorkspace>[] = [];
  let currentId: string | null = id;

  while (currentId) {
    const row: typeof workspace.$inferSelect | undefined =
      await db.query.workspace.findFirst({
        where: eq(workspace.id, currentId),
      });
    if (!row) {
      if (chain.length === 0) return notFound(c, "workspace_not_found");
      break;
    }
    chain.unshift(serializeWorkspace(row));
    currentId = row.parentId;
  }

  return c.json(chain);
});

workspacesRoutes.get("/", async (c) => {
  const userId = identityUserId(c);
  const roots = await db.query.workspace.findMany({
    where: userId
      ? and(isNull(workspace.parentId), eq(workspace.ownerId, userId))
      : isNull(workspace.parentId),
  });
  return c.json(roots.map(serializeWorkspace));
});

function serializeWorkspace(row: typeof workspace.$inferSelect) {
  return {
    id: row.id,
    parent_id: row.parentId,
    slug: row.slug,
    name: row.name,
    kind: row.kind,
    owner_id: row.ownerId,
    created_at: row.createdAt.toISOString(),
  };
}
