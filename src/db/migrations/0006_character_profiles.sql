CREATE TABLE IF NOT EXISTS "character_profile" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "display_name" text NOT NULL,
  "normalized_name" text NOT NULL,
  "custom_id" text,
  "avatar_url" text,
  "aliases" text[] DEFAULT '{}'::text[],
  "relationship" text,
  "summary" text,
  "context" text,
  "source" text DEFAULT 'manual' NOT NULL,
  "confidence" integer DEFAULT 1 NOT NULL,
  "mention_count" integer DEFAULT 0 NOT NULL,
  "first_seen_at" timestamp,
  "last_seen_at" timestamp,
  "metadata" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "character_reference" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "character_id" text NOT NULL,
  "source_type" text NOT NULL,
  "source_id" text NOT NULL,
  "source_title" text,
  "source_href" text,
  "excerpt" text NOT NULL,
  "occurred_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "character_profile_user_id_idx" ON "character_profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "character_profile_normalized_name_idx" ON "character_profile" USING btree ("normalized_name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "character_profile_unique_idx" ON "character_profile" USING btree ("user_id","normalized_name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "character_profile_custom_id_idx" ON "character_profile" USING btree ("user_id","custom_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "character_reference_user_id_idx" ON "character_reference" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "character_reference_character_id_idx" ON "character_reference" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "character_reference_source_idx" ON "character_reference" USING btree ("source_type","source_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "character_reference_unique_idx" ON "character_reference" USING btree ("user_id","character_id","source_type","source_id");--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "character_profile" ADD CONSTRAINT "character_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "character_reference" ADD CONSTRAINT "character_reference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "character_reference" ADD CONSTRAINT "character_reference_character_id_character_profile_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."character_profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
