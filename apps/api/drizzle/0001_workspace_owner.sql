ALTER TABLE "workspace" ADD COLUMN "owner_id" text;
--> statement-breakpoint
CREATE INDEX "workspace_owner_idx" ON "workspace" USING btree ("owner_id");
