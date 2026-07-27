import type { DiaryEvent, DomainDictionary } from "./types.js";
import { defaultDictionary } from "./defaultDictionary.js";

function fillTemplate(
  template: string,
  payload: Record<string, unknown>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = payload[key];
    if (value === undefined || value === null) return "";
    return String(value);
  });
}

export function resolveEventCopy(
  event: DiaryEvent,
  dictionary: DomainDictionary = defaultDictionary,
) {
  const cfg = dictionary.eventTypes[event.type];
  const label = cfg?.label ?? event.type;
  const summary = cfg?.summary
    ? fillTemplate(cfg.summary, event.payload).trim()
    : Object.keys(event.payload).length > 0
      ? JSON.stringify(event.payload)
      : "";
  const mediaClassName = cfg?.mediaClassName ?? "bg-gray-400";
  return { label, summary, mediaClassName };
}
