import { eq, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { CreateWorkspaceSchema } from "@monodiary/timeline-core";
import { db } from "../db/client.js";
import { workspace } from "../db/schema.js";
import { badRequest, notFound, zodError } from "../lib/errors.js";

export const workspacesRoutes = new Hono();

workspacesRoutes.post("/", async (c) => {
  const parsed = CreateWorkspaceSchema.safeParse(await c.req.json());
  if (!parsed.success) return zodError(c, parsed.error);

  const { parent_id, slug, name, kind } = parsed.data;

  if (parent_id) {
    const parent = await db.query.workspace.findFirst({
      where: eq(workspace.id, parent_id),
    });
    if (!parent) return badRequest(c, "parent_not_found");
  }

  const [row] = await db
    .insert(workspace)
    .values({
      parentId: parent_id ?? null,
      slug,
      name,
      kind,
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
  return c.json(serializeWorkspace(row));
});

workspacesRoutes.get("/:id/children", async (c) => {
  const id = c.req.param("id");
  const parent = await db.query.workspace.findFirst({
    where: eq(workspace.id, id),
  });
  if (!parent) return notFound(c, "workspace_not_found");

  const children = await db.query.workspace.findMany({
    where: eq(workspace.parentId, id),
  });
  return c.json(children.map(serializeWorkspace));
});

workspacesRoutes.get("/:id/breadcrumbs", async (c) => {
  const id = c.req.param("id");
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

/** Root workspaces helper for smoke / ops */
workspacesRoutes.get("/", async (c) => {
  const roots = await db.query.workspace.findMany({
    where: isNull(workspace.parentId),
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
    created_at: row.createdAt.toISOString(),
  };
}
