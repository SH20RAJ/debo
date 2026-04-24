import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function createTable() {
  console.log("Creating ai_provider table...");
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "ai_provider" (
        "id" text PRIMARY KEY,
        "user_id" text NOT NULL,
        "provider_id" text NOT NULL,
        "provider_name" text NOT NULL,
        "api_key" text,
        "base_url" text,
        "is_enabled" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("Table created successfully!");
  } catch (error) {
    console.error("Failed to create table:", error);
  }
  process.exit(0);
}

createTable();
