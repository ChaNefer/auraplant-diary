import { DiaryTimeline, defaultDictionary } from "@monodiary/ui-shared";
import { useCallback, useEffect, useState } from "react";
import {
  getTimeline,
  listEntities,
  postEvent,
  type Entity,
} from "./api";
import type { DiaryEvent } from "@monodiary/ui-shared";

const plantDictionary = {
  ...defaultDictionary,
  emptyLabel: "No readings yet — add a measurement",
  alertLabel: "Dry",
  eventTypes: {
    ...defaultDictionary.eventTypes,
    "measurement.humidity": {
      label: "Wilgotność",
      summary: "{value} {unit}",
      mediaClassName: "bg-sky-600",
    },
  },
};

export default function App() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [entityId, setEntityId] = useState<string>("");
  const [events, setEvents] = useState<DiaryEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const refreshTimeline = useCallback(async (id: string) => {
    const timeline = await getTimeline(id);
    setEvents(timeline);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const list = await listEntities();
        if (cancelled) return;
        setEntities(list);
        const preferred =
          list.find((e) => e.external_key === "plant:fikus-demo") ?? list[0];
        if (preferred) {
          setEntityId(preferred.id);
          await refreshTimeline(preferred.id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshTimeline]);

  async function onSelectEntity(id: string) {
    setEntityId(id);
    setError(null);
    try {
      await refreshTimeline(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function addReading(value: number) {
    if (!entityId) return;
    setPosting(true);
    setError(null);
    try {
      await postEvent(entityId, {
        type: "measurement.humidity",
        source: "diary-web:manual",
        payload: { value, unit: "%" },
      });
      await refreshTimeline(entityId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPosting(false);
    }
  }

  const current = entities.find((e) => e.id === entityId);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-10 sm:px-8">
      <header className="mb-10">
        <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-moss uppercase">
          MonoDiary
        </p>
        <h1 className="font-display text-4xl text-ink sm:text-5xl">
          Entity Timeline
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
          Eyris Timeline skin over the universal event API. Domain labels come
          from a dictionary — swap the pack, keep the core.
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-stone-300/70 bg-white/70 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-end sm:justify-between">
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium text-stone-700">Entity</span>
          <select
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-moss"
            value={entityId}
            disabled={loading || entities.length === 0}
            onChange={(e) => void onSelectEntity(e.target.value)}
          >
            {entities.length === 0 && <option value="">No entities</option>}
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.display_name}
                {e.external_key ? ` (${e.external_key})` : ""}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!entityId || posting}
            onClick={() => void addReading(48)}
            className="rounded-lg bg-moss px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            + 48% humidity
          </button>
          <button
            type="button"
            disabled={!entityId || posting}
            onClick={() => void addReading(12)}
            className="rounded-lg bg-clay px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            + 12% (alert)
          </button>
        </div>
      </div>

      {current && (
        <p className="mb-4 text-xs text-stone-500">
          Workspace snapshot lives on each event · current pin{" "}
          <code className="rounded bg-stone-200/80 px-1">
            {current.workspace_id.slice(0, 8)}…
          </code>
        </p>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
          <div className="mt-1 text-xs text-rose-600">
            Is the API running on :3000? Try{" "}
            <code>pnpm --filter @monodiary/api dev</code>
          </div>
        </div>
      )}

      <main className="rounded-2xl border border-stone-300/70 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-8">
        {loading ? (
          <p className="text-sm text-stone-500">Loading timeline…</p>
        ) : (
          <DiaryTimeline events={events} dictionary={plantDictionary} />
        )}
      </main>
    </div>
  );
}
