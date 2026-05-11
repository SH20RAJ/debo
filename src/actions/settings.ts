"use server";

import { db } from "@/db";
import { userPreferences, aiProviders } from "@/db/schema";
import { resolveUserId } from "./auth-sync";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { encrypt } from "@/lib/encryption";
import { logDatabaseIssue } from "@/lib/db/errors";

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
