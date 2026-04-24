import { db } from "../src/db"; // Fixed path
import { sql } from "drizzle-orm";

async function fixDb() {
  console.log("Adding missing columns to user_preference table...");
  try {
    await db.execute(sql`
      ALTER TABLE "user_preference" 
      ADD COLUMN IF NOT EXISTS "ollama_url" text,
      ADD COLUMN IF NOT EXISTS "mcp_url" text,
      ADD COLUMN IF NOT EXISTS "active_provider" text DEFAULT 'cloudflare';
    `);
    console.log("Columns added successfully!");
  } catch (error) {
    console.error("Failed to add columns:", error);
  }
  process.exit(0);
}

fixDb();
