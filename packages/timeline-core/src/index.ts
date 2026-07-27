import { z } from "zod";

export const WorkspaceKindSchema = z.enum(["org", "place", "case"]);
export type WorkspaceKind = z.infer<typeof WorkspaceKindSchema>;

export const CreateWorkspaceSchema = z.object({
  parent_id: z.string().uuid().nullable().optional(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
  name: z.string().min(1).max(200),
  kind: WorkspaceKindSchema.default("place"),
});
export type CreateWorkspace = z.infer<typeof CreateWorkspaceSchema>;

export const CreateEntitySchema = z.object({
  workspace_id: z.string().uuid(),
  display_name: z.string().min(1).max(200),
  external_key: z.string().min(1).max(200).nullable().optional(),
});
export type CreateEntity = z.infer<typeof CreateEntitySchema>;

export const TransferEntitySchema = z.object({
  to_workspace_id: z.string().uuid(),
  reason: z.string().max(500).nullable().optional(),
});
export type TransferEntity = z.infer<typeof TransferEntitySchema>;

export const EventInputSchema = z.object({
  entity_id: z.string().uuid(),
  ts: z.string().datetime({ offset: true }),
  type: z.string().min(1).max(120),
  source: z.string().min(1).max(200),
  payload: z.record(z.unknown()).default({}),
  flags: z.array(z.string().min(1)).default([]),
  schema_version: z.number().int().positive().default(1),
});
export type EventInput = z.infer<typeof EventInputSchema>;

const optionalDateTime = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.string().datetime({ offset: true }).optional(),
);
const optionalString = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.string().min(1).optional(),
);

export const TimelineQuerySchema = z.object({
  from: optionalDateTime,
  to: optionalDateTime,
  type: optionalString,
  flag: optionalString,
});
export type TimelineQuery = z.infer<typeof TimelineQuerySchema>;

/** Correction / void events reference another event id in payload. */
export const SYSTEM_EVENT_TYPES = {
  void: "system.void",
  correction: "system.correction",
} as const;
