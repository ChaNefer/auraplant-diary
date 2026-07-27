import type { ReactNode } from "react";

/** Shape matching apps/api timeline event response. */
export type DiaryEvent = {
  id: string;
  entity_id: string;
  workspace_id: string;
  ts: string;
  type: string;
  source: string;
  payload: Record<string, unknown>;
  flags: string[];
  schema_version: number;
  created_at: string;
};

export type EventTypeConfig = {
  label: string;
  /** Short description template; `{key}` replaced from payload */
  summary?: string;
  mediaClassName?: string;
};

/** Domain dictionary — same UI, different words per pack. */
export type DomainDictionary = {
  emptyLabel?: string;
  alertLabel?: string;
  eventTypes: Record<string, EventTypeConfig>;
};

export type DiaryTimelineProps = {
  events: DiaryEvent[];
  dictionary?: DomainDictionary;
  className?: string;
  renderMedia?: (event: DiaryEvent) => ReactNode;
  renderBody?: (event: DiaryEvent, label: string, summary: string) => ReactNode;
};
