CREATE TABLE "attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid,
	"entity_id" uuid NOT NULL,
	"content_type" text NOT NULL,
	"storage_key" text NOT NULL,
	"sha256" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"external_key" text,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entity_workspace_move" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"from_workspace" uuid,
	"to_workspace" uuid NOT NULL,
	"moved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"ts" timestamp with time zone NOT NULL,
	"type" text NOT NULL,
	"source" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"flags" text[] DEFAULT '{}' NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"kind" text DEFAULT 'place' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_entity_id_entity_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity" ADD CONSTRAINT "entity_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_workspace_move" ADD CONSTRAINT "entity_workspace_move_entity_id_entity_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_workspace_move" ADD CONSTRAINT "entity_workspace_move_from_workspace_workspace_id_fk" FOREIGN KEY ("from_workspace") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_workspace_move" ADD CONSTRAINT "entity_workspace_move_to_workspace_workspace_id_fk" FOREIGN KEY ("to_workspace") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_entity_id_entity_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_parent_id_workspace_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachment_entity_idx" ON "attachment" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "attachment_event_idx" ON "attachment" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "entity_workspace_idx" ON "entity" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "entity_external_key_uidx" ON "entity" USING btree ("external_key");--> statement-breakpoint
CREATE INDEX "entity_move_entity_idx" ON "entity_workspace_move" USING btree ("entity_id","moved_at");--> statement-breakpoint
CREATE INDEX "event_entity_ts_idx" ON "event" USING btree ("entity_id","ts");--> statement-breakpoint
CREATE INDEX "event_workspace_ts_idx" ON "event" USING btree ("workspace_id","ts");--> statement-breakpoint
CREATE INDEX "event_type_idx" ON "event" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_slug_uidx" ON "workspace" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "workspace_parent_idx" ON "workspace" USING btree ("parent_id");