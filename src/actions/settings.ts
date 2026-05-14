"use server";

import { db } from "@/db";
import { userPreferences, aiProviders, memoryFacts } from "@/db/schema";
import { resolveUserId } from "./auth-sync";
import { eq, and, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { encrypt } from "@/lib/encryption";
import { logDatabaseIssue } from "@/lib/db/errors";

const DEBO_TONES = ["warm", "calm", "direct", "coach", "concise"] as const;
export type DeboTone = (typeof DEBO_TONES)[number];

export type DeboSettings = {
  assistantName: string;
  userDisplayName: string;
  tone: DeboTone;
};

const SETTINGS_FACT_PREFIX = "debo_settings:";
const DEFAULT_DEBO_SETTINGS: DeboSettings = {
  assistantName: "Debo",
  userDisplayName: "",
  tone: "warm",
};

function sanitizeSettingText(value: unknown, fallback: string, max = 64) {
  const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  return text ? text.slice(0, max) : fallback;
}

function parseDeboTone(value: unknown): DeboTone {
  return DEBO_TONES.includes(value as DeboTone) ? (value as DeboTone) : DEFAULT_DEBO_SETTINGS.tone;
}

function parseDeboSettings(value: string | null | undefined): DeboSettings | null {
  if (!value?.startsWith(SETTINGS_FACT_PREFIX)) return null;

  try {
    const parsed = JSON.parse(value.slice(SETTINGS_FACT_PREFIX.length)) as Partial<DeboSettings>;
    return {
      assistantName: sanitizeSettingText(parsed.assistantName, DEFAULT_DEBO_SETTINGS.assistantName),
      userDisplayName: sanitizeSettingText(parsed.userDisplayName, DEFAULT_DEBO_SETTINGS.userDisplayName),
      tone: parseDeboTone(parsed.tone),
    };
  } catch {
    return null;
  }
}

export async function getDeboSettings(providedUserId?: string): Promise<DeboSettings> {
  const userId = await resolveUserId(providedUserId, true);
  if (!userId) return DEFAULT_DEBO_SETTINGS;

  try {
    const rows = await db.query.memoryFacts.findMany({
      where: and(
        eq(memoryFacts.userId, userId),
        eq(memoryFacts.type, "setting"),
        like(memoryFacts.content, `${SETTINGS_FACT_PREFIX}%`),
      ),
      limit: 1,
    });

    return parseDeboSettings(rows[0]?.content) || DEFAULT_DEBO_SETTINGS;
  } catch (error) {
    logDatabaseIssue("debo settings read", error);
    return DEFAULT_DEBO_SETTINGS;
  }
}

export async function saveDeboSettings(data: Partial<DeboSettings>, providedUserId?: string) {
  const userId = await resolveUserId(providedUserId, true);
  if (!userId) throw new Error("Unauthorized");

  const settings: DeboSettings = {
    assistantName: sanitizeSettingText(data.assistantName, DEFAULT_DEBO_SETTINGS.assistantName),
    userDisplayName: sanitizeSettingText(data.userDisplayName, DEFAULT_DEBO_SETTINGS.userDisplayName),
    tone: parseDeboTone(data.tone),
  };

  try {
    await db.delete(memoryFacts).where(
      and(
        eq(memoryFacts.userId, userId),
        eq(memoryFacts.type, "setting"),
        like(memoryFacts.content, `${SETTINGS_FACT_PREFIX}%`),
      ),
    );

    await db.insert(memoryFacts).values({
      id: crypto.randomUUID(),
      userId,
      type: "setting",
      content: `${SETTINGS_FACT_PREFIX}${JSON.stringify(settings)}`,
      weight: 5,
    });

    revalidatePath("/dashboard/settings");
    return { success: true, data: settings };
  } catch (error) {
    logDatabaseIssue("debo settings save", error);
    return { success: false, error: "Settings could not be saved" };
  }
}

export async function getUserPreferences() {
  const userId = await resolveUserId(undefined, true);
  if (!userId) throw new Error("Unauthorized");

  try {
    const prefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    if (prefs) {
      return {
        ...prefs,
        openaiKey: prefs.openaiKey ? "sk-....config" : null,
        anthropicKey: prefs.anthropicKey ? "sk-ant-....config" : null,
      };
    }

    return prefs;
  } catch (e) {
    logDatabaseIssue("settings preferences", e);
    return null;
  }
}

export async function getAIProviders() {
  const userId = await resolveUserId(undefined, true);
  if (!userId) throw new Error("Unauthorized");

  try {
    const providers = await db.query.aiProviders.findMany({
      where: eq(aiProviders.userId, userId),
    });

    return providers.map((p) => ({
      ...p,
      apiKey: p.apiKey ? "sk-....config" : null,
    }));
  } catch (error) {
    logDatabaseIssue("settings ai providers", error);
    return [];
  }
}

export async function saveAIProvider(data: {
  providerId: string;
  providerName: string;
  apiKey?: string;
  baseUrl?: string;
  isEnabled?: boolean;
}) {
  const userId = await resolveUserId(undefined, true);
  if (!userId) throw new Error("Unauthorized");

  try {
    const encryptedKey =
      data.apiKey && !data.apiKey.includes("....config")
        ? await encrypt(data.apiKey)
        : undefined;

    const existing = await db.query.aiProviders.findFirst({
      where: and(
        eq(aiProviders.userId, userId),
        eq(aiProviders.providerId, data.providerId),
      ),
    });

    if (existing) {
      await db
        .update(aiProviders)
        .set({
          providerName: data.providerName,
          baseUrl: data.baseUrl || null,
          apiKey: encryptedKey || undefined,
          isEnabled: data.isEnabled ?? true,
          updatedAt: new Date(),
        })
        .where(eq(aiProviders.id, existing.id));
    } else {
      await db.insert(aiProviders).values({
        id: crypto.randomUUID(),
        userId: userId,
        providerId: data.providerId,
        providerName: data.providerName,
        baseUrl: data.baseUrl || null,
        apiKey: encryptedKey || null,
        isEnabled: data.isEnabled ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath("/dashboard/settings");
    return true;
  } catch (error) {
    logDatabaseIssue("settings save provider", error);
    return false;
  }
}

export async function setActiveProvider(providerId: string) {
  const userId = await resolveUserId(undefined, true);
  if (!userId) throw new Error("Unauthorized");

  try {
    const existing = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    if (existing) {
      await db
        .update(userPreferences)
        .set({ activeProvider: providerId, updatedAt: new Date() })
        .where(eq(userPreferences.userId, userId));
    } else {
      await db.insert(userPreferences).values({
        userId,
        activeProvider: providerId,
        updatedAt: new Date(),
      });
    }

    revalidatePath("/dashboard/settings");
    return true;
  } catch (error) {
    logDatabaseIssue("settings active provider", error);
    return false;
  }
}

export async function saveUserPreferences(data: {
  mcpUrl?: string;
  activeProvider?: string;
}) {
  const userId = await resolveUserId(undefined, true);
  if (!userId) throw new Error("Unauthorized");

  try {
    const updateData: Record<string, string | Date | null> = {
      activeProvider: data.activeProvider || "cloudflare",
      mcpUrl: data.mcpUrl || null,
      updatedAt: new Date(),
    };

    const existing = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    if (existing) {
      await db
        .update(userPreferences)
        .set(updateData)
        .where(eq(userPreferences.userId, userId));
    } else {
      await db.insert(userPreferences).values({
        userId: userId,
        ...updateData,
      });
    }

    revalidatePath("/dashboard/settings");
    return true;
  } catch (error) {
    logDatabaseIssue("settings save preferences", error);
    return false;
  }
}
