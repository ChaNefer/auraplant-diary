import type { DomainDictionary } from "./types.js";

/** Neutral + AuraPlant-ish defaults for the greenfield demo app. */
export const defaultDictionary: DomainDictionary = {
  emptyLabel: "No events yet",
  alertLabel: "Alert",
  eventTypes: {
    "measurement.humidity": {
      label: "Humidity",
      summary: "{value}{unit}",
      mediaClassName: "bg-sky-500",
    },
    "measurement.moisture": {
      label: "Soil moisture",
      summary: "{value}{unit}",
      mediaClassName: "bg-emerald-500",
    },
    "note.text": {
      label: "Note",
      summary: "{text}",
      mediaClassName: "bg-amber-500",
    },
    "system.correction": {
      label: "Correction",
      summary: "Corrected prior event",
      mediaClassName: "bg-violet-500",
    },
    "system.void": {
      label: "Voided",
      summary: "Event voided",
      mediaClassName: "bg-gray-500",
    },
  },
};
