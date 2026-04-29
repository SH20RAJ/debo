"use server"

import { db } from "@/db";
import { userPreferences, aiProviders } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/encryption";
import { nango } from "@/lib/nango";

export async function getUserPreferences() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    try {
        const prefs = await db.query.userPreferences.findFirst({
            where: eq(userPreferences.userId, session.user.id),
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
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    const providers = await db.query.aiProviders.findMany({
        where: eq(aiProviders.userId, session.user.id),
    });

    // Mask API keys
    return providers.map(p => ({
        ...p,
        apiKey: p.apiKey ? "sk-....config" : null,
    }));
}

export async function saveAIProvider(data: {
    providerId: string,
    providerName: string,
    apiKey?: string,
    baseUrl?: string,
    isEnabled?: boolean
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    const encryptedKey = data.apiKey && !data.apiKey.includes("....config")
        ? await encrypt(data.apiKey)
        : undefined;

    const existing = await db.query.aiProviders.findFirst({
        where: and(
            eq(aiProviders.userId, session.user.id),
            eq(aiProviders.providerId, data.providerId)
        )
    });

    const updateData: any = {
        providerName: data.providerName,
        baseUrl: data.baseUrl || null,
        isEnabled: data.isEnabled ?? true,
        updatedAt: new Date()
    };

    if (encryptedKey) updateData.apiKey = encryptedKey;

    if (existing) {
        await db.update(aiProviders).set(updateData).where(eq(aiProviders.id, existing.id));
    } else {
        await db.insert(aiProviders).values({
            id: crypto.randomUUID(),
            userId: session.user.id,
            providerId: data.providerId,
            ...updateData,
            apiKey: encryptedKey || null,
        });
    }

    revalidatePath("/dashboard/settings");
    return true;
}

export async function setActiveProvider(providerId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    await db.update(userPreferences)
        .set({ activeProvider: providerId, updatedAt: new Date() })
        .where(eq(userPreferences.userId, session.user.id));

    revalidatePath("/dashboard/settings");
    return true;
}

export async function saveUserPreferences(data: { 
    mcpUrl?: string, 
    activeProvider?: string,
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    const updateData: any = {
        activeProvider: data.activeProvider || "cloudflare",
        mcpUrl: data.mcpUrl || null,
        updatedAt: new Date()
    };

    const existing = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, session.user.id)
    });

    if (existing) {
        await db.update(userPreferences).set(updateData).where(eq(userPreferences.userId, session.user.id));
    } else {
        await db.insert(userPreferences).values({
            userId: session.user.id,
            ...updateData,
        });
    }

    revalidatePath("/dashboard/settings");
    return true;
}

// ... Keep existing Nango actions ...

export async function getNangoConnections() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    try {
        const key = process.env.NANGO_SECRET_KEY;
        if (!key || key.length < 32 || key === "placeholder_secret_key") {
            return [];
        }
        
        const connections = await nango.listConnections(session.user.id);
        return connections;
    } catch (error) {
        console.error("Failed to list Nango connections:", error);
        return [];
    }
}

export async function deleteNangoConnection(providerConfigKey: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    try {
        await nango.deleteConnection(providerConfigKey, session.user.id);
        revalidatePath("/dashboard/settings");
        return true;
    } catch (error) {
        console.error("Failed to delete Nango connection:", error);
        return false;
    }
}
