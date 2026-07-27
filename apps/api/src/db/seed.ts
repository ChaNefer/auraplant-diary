import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, sql } from "./client.js";
import { entity, event, workspace } from "./schema.js";
import { applyTriage } from "../triage/engine.js";

async function upsertWorkspace(input: {
  slug: string;
  name: string;
  kind: string;
  parentId?: string | null;
}) {
  const existing = await db.query.workspace.findFirst({
    where: eq(workspace.slug, input.slug),
  });
  if (existing) return existing;

  const [row] = await db
    .insert(workspace)
    .values({
      slug: input.slug,
      name: input.name,
      kind: input.kind,
      parentId: input.parentId ?? null,
    })
    .returning();
  return row;
}

const house = await upsertWorkspace({
  slug: "dom-demo",
  name: "Dom",
  kind: "place",
});
const floor = await upsertWorkspace({
  slug: "dom-demo-pietro-1",
  name: "Piętro 1",
  kind: "place",
  parentId: house.id,
});
const room = await upsertWorkspace({
  slug: "dom-demo-pokoj-salon",
  name: "Salon",
  kind: "place",
  parentId: floor.id,
});

let fikus = await db.query.entity.findFirst({
  where: eq(entity.externalKey, "plant:fikus-demo"),
});
if (!fikus) {
  const [created] = await db
    .insert(entity)
    .values({
      workspaceId: room.id,
      displayName: "Fikus",
      externalKey: "plant:fikus-demo",
    })
    .returning();
  fikus = created;
}

const existingEvents = await db.query.event.findMany({
  where: eq(event.entityId, fikus.id),
});

if (existingEvents.length === 0) {
  const samples = [
    {
      ts: new Date("2026-07-27T08:00:00.000Z"),
      type: "measurement.humidity",
      source: "device:esp32-c3:seed",
      payload: { value: 42, unit: "%" },
    },
    {
      ts: new Date("2026-07-27T18:00:00.000Z"),
      type: "measurement.humidity",
      source: "device:esp32-c3:seed",
      payload: { value: 15, unit: "%" },
    },
  ];

  for (const sample of samples) {
    const flags = applyTriage(sample.type, sample.payload, []);
    await db.insert(event).values({
      entityId: fikus.id,
      workspaceId: fikus.workspaceId,
      ts: sample.ts,
      type: sample.type,
      source: sample.source,
      payload: sample.payload,
      flags,
      schemaVersion: 1,
    });
  }
}

console.log(
  JSON.stringify(
    {
      workspace_tree: [house.slug, floor.slug, room.slug],
      entity_id: fikus.id,
      entity_name: fikus.displayName,
    },
    null,
    2,
  ),
);

await sql.end();
