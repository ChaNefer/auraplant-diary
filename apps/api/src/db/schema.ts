import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const workspace = pgTable(
  "workspace",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    parentId: uuid("parent_id").references((): any => workspace.id),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    kind: text("kind").notNull().default("place"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("workspace_slug_uidx").on(t.slug),
    index("workspace_parent_idx").on(t.parentId),
  ],
);

export const entity = pgTable(
  "entity",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id),
    externalKey: text("external_key"),
    displayName: text("display_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("entity_workspace_idx").on(t.workspaceId),
    uniqueIndex("entity_external_key_uidx").on(t.externalKey),
  ],
);

export const event = pgTable(
  "event",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entity.id),
    /** Snapshot of workspace at write time — never rewritten on transfer. */
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id),
    ts: timestamp("ts", { withTimezone: true }).notNull(),
    type: text("type").notNull(),
    source: text("source").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    flags: text("flags").array().notNull().default([]),
    schemaVersion: integer("schema_version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("event_entity_ts_idx").on(t.entityId, t.ts),
    index("event_workspace_ts_idx").on(t.workspaceId, t.ts),
    index("event_type_idx").on(t.type),
  ],
);

export const entityWorkspaceMove = pgTable(
  "entity_workspace_move",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entity.id),
    fromWorkspace: uuid("from_workspace").references(() => workspace.id),
    toWorkspace: uuid("to_workspace")
      .notNull()
      .references(() => workspace.id),
    movedAt: timestamp("moved_at", { withTimezone: true }).notNull().defaultNow(),
    reason: text("reason"),
  },
  (t) => [index("entity_move_entity_idx").on(t.entityId, t.movedAt)],
);

export const attachment = pgTable(
  "attachment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id").references(() => event.id),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entity.id),
    contentType: text("content_type").notNull(),
    storageKey: text("storage_key").notNull(),
    sha256: text("sha256"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("attachment_entity_idx").on(t.entityId),
    index("attachment_event_idx").on(t.eventId),
  ],
);

export type Workspace = typeof workspace.$inferSelect;
export type Entity = typeof entity.$inferSelect;
export type Event = typeof event.$inferSelect;
