"use server"

import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/encryption";

export async function getUserPreferences() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

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
}

export async function saveUserPreferences(data: { 
    openaiKey?: string, 
    anthropicKey?: string,
    ollamaUrl?: string,
    activeProvider?: string 
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    // Only encrypt if a new key is provided (not the masked placeholder)
    const encryptedOpenai = data.openaiKey && !data.openaiKey.includes("....config") 
        ? encrypt(data.openaiKey) 
        : undefined;
    
    const encryptedAnthropic = data.anthropicKey && !data.anthropicKey.includes("....config")
        ? encrypt(data.anthropicKey)
        : undefined;

    const updateData: any = {
        activeProvider: data.activeProvider || "cloudflare",
        ollamaUrl: data.ollamaUrl || null,
        updatedAt: new Date()
    };

    if (encryptedOpenai) updateData.openaiKey = encryptedOpenai;
    if (encryptedAnthropic) updateData.anthropicKey = encryptedAnthropic;

    const existing = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, session.user.id),
    });

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
