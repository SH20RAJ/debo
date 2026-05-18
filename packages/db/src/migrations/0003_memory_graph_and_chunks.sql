CREATE TABLE "memory_node" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "type" text NOT NULL,
  "name" text NOT NULL,
  "normalized_name" text NOT NULL,
  "weight" text DEFAULT '1' NOT NULL,
  "first_seen_at" timestamp NOT NULL,
  "last_seen_at" timestamp NOT NULL,
  "metadata" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "memory_edge" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "from_key" text NOT NULL,
  "to_key" text NOT NULL,
  "relation" text NOT NULL,
  "weight" text DEFAULT '1' NOT NULL,
  "last_seen_at" timestamp NOT NULL,
  "metadata" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX "memory_node_user_id_idx" ON "memory_node" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "memory_node_type_idx" ON "memory_node" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "memory_node_unique_idx" ON "memory_node" USING btree ("user_id","type","normalized_name");--> statement-breakpoint
CREATE INDEX "memory_edge_user_id_idx" ON "memory_edge" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "memory_edge_relation_idx" ON "memory_edge" USING btree ("relation");--> statement-breakpoint
CREATE UNIQUE INDEX "memory_edge_unique_idx" ON "memory_edge" USING btree ("user_id","from_key","to_key","relation");