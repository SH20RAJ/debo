CREATE TABLE "memory_fact" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "content" text NOT NULL,
  "type" text NOT NULL,
  "weight" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "memory_entity" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "normalized_name" text NOT NULL,
  "type" text NOT NULL,
  "frequency" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX "memory_fact_user_id_idx" ON "memory_fact" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "memory_fact_type_idx" ON "memory_fact" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "memory_fact_unique_idx" ON "memory_fact" USING btree ("user_id","type","content");--> statement-breakpoint
CREATE INDEX "memory_entity_user_id_idx" ON "memory_entity" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "memory_entity_type_idx" ON "memory_entity" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "memory_entity_unique_idx" ON "memory_entity" USING btree ("user_id","type","normalized_name");--> statement-breakpoint
ALTER TABLE "user_preference" DROP COLUMN IF EXISTS "mem0_key";--> statement-breakpoint
ALTER TABLE "user_preference" DROP COLUMN IF EXISTS "mem0_url";