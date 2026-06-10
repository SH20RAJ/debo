import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { db } from "@debo/db";
import { users, workspaces } from "@debo/db/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

// Load local workspace .env if present
dotenv.config();

const CONFIG_PATH = path.join(os.homedir(), ".deboconfig");

export interface DeboCliConfig {
  userId?: string;
  workspaceId?: string;
  token?: string;
}

export function loadConfig(): DeboCliConfig {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    } catch {
      // return empty if malformed
    }
  }
  return {};
}

export function saveConfig(config: DeboCliConfig) {
  const current = loadConfig();
  const updated = { ...current, ...config };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), "utf-8");
}

export async function resolveSession() {
  const config = loadConfig();
  
  let userId = process.env.DEBO_USER_ID || config.userId;
  let workspaceId = process.env.DEBO_WORKSPACE_ID || config.workspaceId;

  // Database auto-resolving fallback if environment/config is empty
  if (!userId) {
    const [firstUser] = await db.select().from(users).limit(1);
    if (!firstUser) {
      throw new Error("No users found in the database. Please register a user or create an account.");
    }
    userId = firstUser.id;
  }

  if (!workspaceId) {
    const [firstWS] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.ownerUserId, userId))
      .limit(1);
    if (firstWS) {
      workspaceId = firstWS.id;
    } else {
      throw new Error(`No workspace found for user: ${userId}`);
    }
  }

  return { userId, workspaceId };
}
