import "dotenv/config";
import { db } from "../db";
import { user } from "../db/schema";
import { count } from "drizzle-orm";

async function test() {
  console.log("Checking DB connection...");
  const [result] = await db.select({ value: count() }).from(user);
  console.log(`✅ DB Connected. User count: ${result.value}`);
}

test().catch(console.error);
