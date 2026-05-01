"use server";

import { db } from "@/db";
import { userPreferences, aiProviders } from "@/db/schema";
import { stackServerApp } from "@/stack/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { encrypt } from "@/lib/encryption";
import { nango } from "@/lib/nango";

export async function getUserPreferences() {
  const user = await stackServerApp.getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const prefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, user.id),
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
    console.error("Database error in getUserPreferences:", e);
    return null;
  }
}

export async function getAIProviders() {
  const user = await stackServerApp.getUser();
  if (!user) throw new Error("Unauthorized");

  const providers = await db.query.aiProviders.findMany({
    where: eq(aiProviders.userId, user.id),
  });

  return providers.map((p) => ({
    ...p,
    apiKey: p.apiKey ? "sk-....config" : null,
  }));
}

export async function saveAIProvider(data: {
  providerId: string;
  providerName: string;
  apiKey?: string;
  baseUrl?: string;
  isEnabled?: boolean;
}) {
  const user = await stackServerApp.getUser();
  if (!user) throw new Error("Unauthorized");

  const encryptedKey =
    data.apiKey && !data.apiKey.includes("....config")
      ? await encrypt(data.apiKey)
      : undefined;

  const existing = await db.query.aiProviders.findFirst({
    where: and(
      eq(aiProviders.userId, user.id),
      eq(aiProviders.providerId, data.providerId),
    ),
  });

  const updateData: any = {
    providerName: data.providerName,
    baseUrl: data.baseUrl || null,
    isEnabled: data.isEnabled ?? true,
    updatedAt: new Date(),
  };

  if (encryptedKey) updateData.apiKey = encryptedKey;

  if (existing) {
    await db
      .update(aiProviders)
      .set(updateData)
      .where(eq(aiProviders.id, existing.id));
  } else {
    await db.insert(aiProviders).values({
      id: crypto.randomUUID(),
      userId: user.id,
      providerId: data.providerId,
      ...updateData,
      apiKey: encryptedKey || null,
    });
  }

  revalidatePath("/dashboard/settings");
  return true;
}

export async function setActiveProvider(providerId: string) {
  const user = await stackServerApp.getUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .update(userPreferences)
    .set({ activeProvider: providerId, updatedAt: new Date() })
    .where(eq(userPreferences.userId, user.id));

  revalidatePath("/dashboard/settings");
  return true;
}

export async function saveUserPreferences(data: {
  mcpUrl?: string;
  activeProvider?: string;
}) {
  const user = await stackServerApp.getUser();
  if (!user) throw new Error("Unauthorized");

  const updateData: any = {
    activeProvider: data.activeProvider || "cloudflare",
    mcpUrl: data.mcpUrl || null,
    updatedAt: new Date(),
  };

  const existing = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, user.id),
  });

  if (existing) {
    await db
      .update(userPreferences)
      .set(updateData)
      .where(eq(userPreferences.userId, user.id));
  } else {
    await db.insert(userPreferences).values({
      userId: user.id,
      ...updateData,
    });
  }

  revalidatePath("/dashboard/settings");
  return true;
}

/** UUID v4 regex — Nango requires this exact format for secret keys */
const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getNangoConnections() {
  const user = await stackServerApp.getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const key = process.env.NANGO_SECRET_KEY;
    if (!key || !UUID_V4.test(key)) {
      // Nango secret key is not set or is not a valid UUID v4 — skip silently
      return [];
    }

    const connections = await nango.listConnections(user.id);
    return connections;
  } catch (error) {
    console.error("Failed to list Nango connections:", error);
    return [];
  }
}

export async function deleteNangoConnection(providerConfigKey: string) {
  const user = await stackServerApp.getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    await nango.deleteConnection(providerConfigKey, user.id);
    revalidatePath("/dashboard/settings");
    return true;
  } catch (error) {
    console.error("Failed to delete Nango connection:", error);
    return false;
  }
}
