import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { db } from "../db/client.js";
import { workspace } from "../db/schema.js";

export function identityUserId(c: Context) {
  return c.req.header("x-identity-user-id")?.trim() || null;
}

export async function workspaceOwnedBy(
  workspaceId: string,
  userId: string | null,
) {
  if (!userId) return true;
  const row = await db.query.workspace.findFirst({
    where: eq(workspace.id, workspaceId),
  });
  if (!row) return false;
  return !row.ownerId || row.ownerId === userId;
}

export async function ownedWorkspaceIds(userId: string) {
  const rows = await db.query.workspace.findMany({
    where: eq(workspace.ownerId, userId),
  });
  return new Set(rows.map((r) => r.id));
}
