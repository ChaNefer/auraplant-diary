/**
 * Smoke: health → tree → entity → events → timeline → transfer → timeline intact.
 * Requires API running on BASE_URL (default http://127.0.0.1:3000).
 */
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000";

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return data as T;
}

type Workspace = { id: string; slug: string; parent_id: string | null };
type Entity = { id: string; workspace_id: string; display_name: string };
type EventRow = {
  id: string;
  workspace_id: string;
  type: string;
  flags: string[];
  payload: { value?: number };
};

console.log(`Smoke against ${BASE}`);

await req("GET", "/health");

const house = await req<Workspace>("POST", "/workspaces", {
  slug: `smoke-house-${Date.now()}`,
  name: "Smoke House",
  kind: "place",
});
const roomA = await req<Workspace>("POST", "/workspaces", {
  parent_id: house.id,
  slug: `smoke-room-a-${Date.now()}`,
  name: "Room A",
  kind: "place",
});
const roomB = await req<Workspace>("POST", "/workspaces", {
  parent_id: house.id,
  slug: `smoke-room-b-${Date.now()}`,
  name: "Room B",
  kind: "place",
});

const crumbs = await req<Workspace[]>("GET", `/workspaces/${roomA.id}/breadcrumbs`);
if (crumbs.length !== 2 || crumbs[0].id !== house.id) {
  throw new Error("breadcrumbs failed");
}

const plant = await req<Entity>("POST", "/entities", {
  workspace_id: roomA.id,
  display_name: "Smoke Plant",
  external_key: `smoke:plant:${Date.now()}`,
});

const okReading = await req<EventRow>("POST", "/events", {
  entity_id: plant.id,
  ts: "2026-07-27T10:00:00.000Z",
  type: "measurement.humidity",
  source: "smoke",
  payload: { value: 55, unit: "%" },
});
if (okReading.flags.includes("alert")) {
  throw new Error("unexpected alert on healthy reading");
}
if (okReading.workspace_id !== roomA.id) {
  throw new Error("event snapshot workspace mismatch");
}

const lowReading = await req<EventRow>("POST", "/events", {
  entity_id: plant.id,
  ts: "2026-07-27T12:00:00.000Z",
  type: "measurement.humidity",
  source: "smoke",
  payload: { value: 12, unit: "%" },
});
if (!lowReading.flags.includes("alert")) {
  throw new Error("triage failed: expected alert flag");
}

const before = await req<EventRow[]>("GET", `/entities/${plant.id}/timeline`);
if (before.length !== 2) {
  throw new Error(`expected 2 events before transfer, got ${before.length}`);
}

const transfer = await req<{ entity: Entity }>("POST", `/entities/${plant.id}/transfer`, {
  to_workspace_id: roomB.id,
  reason: "smoke transfer",
});
if (transfer.entity.workspace_id !== roomB.id) {
  throw new Error("transfer did not update entity.workspace_id");
}

const after = await req<EventRow[]>("GET", `/entities/${plant.id}/timeline`);
if (after.length !== 2) {
  throw new Error("timeline lost events after transfer");
}
if (!after.every((e) => e.workspace_id === roomA.id)) {
  throw new Error("historical event workspace snapshots must stay on Room A");
}

const flagged = await req<EventRow[]>(
  "GET",
  `/entities/${plant.id}/timeline?flag=alert`,
);
if (flagged.length !== 1 || flagged[0].payload.value !== 12) {
  throw new Error("flag filter failed");
}

console.log("SMOKE OK");
