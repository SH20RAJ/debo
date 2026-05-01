import "dotenv/config";
import { storeMemory } from "../lib/memory/store";
import { db } from "../db";
import { memoryFacts } from "../db/schema";
import { eq, and } from "drizzle-orm";

async function test() {
  const testUserId = "test-user-123";
  const testFact = {
    content: "Testing unique constraint fix " + new Date().toISOString(),
    type: "test" as any
  };

  console.log("1. Attempting first storage...");
  await storeMemory(testUserId, [testFact], []);
  console.log("✅ First storage successful.");

  console.log("2. Attempting storage of the SAME fact (should trigger ON CONFLICT)...");
  await storeMemory(testUserId, [testFact], []);
  console.log("✅ Second storage (upsert) successful.");

  // Clean up
  await db.delete(memoryFacts).where(
    and(
      eq(memoryFacts.userId, testUserId),
      eq(memoryFacts.type, "test")
    )
  );
  console.log("🧹 Cleanup complete.");
}

test().catch(console.error);
