import type { DiaryEvent } from "@monodiary/ui-shared";

export type Entity = {
  id: string;
  workspace_id: string;
  external_key: string | null;
  display_name: string;
  created_at: string;
};

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export function listEntities() {
  return getJson<Entity[]>("/entities");
}

export function getEntity(id: string) {
  return getJson<Entity>(`/entities/${id}`);
}

export function getTimeline(entityId: string) {
  return getJson<DiaryEvent[]>(`/entities/${entityId}/timeline`);
}

export async function postEvent(
  entityId: string,
  body: {
    type: string;
    source: string;
    payload: Record<string, unknown>;
    ts?: string;
  },
) {
  const res = await fetch("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      entity_id: entityId,
      ts: body.ts ?? new Date().toISOString(),
      type: body.type,
      source: body.source,
      payload: body.payload,
      flags: [],
    }),
  });
  if (!res.ok) {
    throw new Error(`POST /events → ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<DiaryEvent>;
}
