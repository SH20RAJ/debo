"use server"

import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { encrypt } from "@/lib/encryption";
import { nango } from "@/lib/nango";

export async function getUserPreferences() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    try {
        const prefs = await db.query.userPreferences.findFirst({
            where: eq(userPreferences.userId, session.user.id),
        });

        if (prefs) {
            // Mask keys for the UI
            return {
                ...prefs,
                openaiKey: prefs.openaiKey ? "sk-....config" : null,
                anthropicKey: prefs.anthropicKey ? "sk-ant-....config" : null,
            };
        }

        return prefs;
    } catch (e) {
        console.error("Database error in getUserPreferences (likely missing columns):", e);
        return null;
    }
}

export async function saveUserPreferences(data: { 
    openaiKey?: string, 
    anthropicKey?: string,
    ollamaUrl?: string,
    mcpUrl?: string,
    activeProvider?: string 
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    // Only encrypt if a new key is provided (not the masked placeholder)
    const encryptedOpenai = data.openaiKey && !data.openaiKey.includes("....config") 
        ? await encrypt(data.openaiKey) 
        : undefined;
    
    const encryptedAnthropic = data.anthropicKey && !data.anthropicKey.includes("....config")
        ? await encrypt(data.anthropicKey)
        : undefined;

    const updateData: any = {
        activeProvider: data.activeProvider || "cloudflare",
        ollamaUrl: data.ollamaUrl || null,
        mcpUrl: data.mcpUrl || null,
        updatedAt: new Date()
    };

    if (encryptedOpenai) updateData.openaiKey = encryptedOpenai;
    if (encryptedAnthropic) updateData.anthropicKey = encryptedAnthropic;

    const existing = await getUserPreferences();

    if (existing) {
        await db.update(userPreferences).set(updateData).where(eq(userPreferences.userId, session.user.id));
    } else {
        await db.insert(userPreferences).values({
            userId: session.user.id,
            ...updateData,
            openaiKey: encryptedOpenai || null,
            anthropicKey: encryptedAnthropic || null,
        });
    }

    revalidatePath("/dashboard/settings");
    return true;
}

export async function getNangoConnections() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    try {
        // Only attempt if key is a valid UUID v4 format (basic check)
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
