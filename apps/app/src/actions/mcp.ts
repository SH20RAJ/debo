"use server"

import { db } from "@/db"
import { userPreferences } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getUserId } from "./auth-sync"
import { revalidatePath } from "next/cache"

export async function getMcpConfig() {
    const userId = await getUserId();
    if (!userId) return null;

    const config = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId)
    });

    if (!config) {
        // Initialize if not exists
        const newKey = crypto.randomUUID();
        await db.insert(userPreferences).values({
            userId,
            mcpKey: newKey,
        });
        return { mcpKey: newKey };
    }

    if (!config.mcpKey) {
        const newKey = crypto.randomUUID();
        await db.update(userPreferences)
            .set({ mcpKey: newKey })
            .where(eq(userPreferences.userId, userId));
        return { mcpKey: newKey };
    }

    return { mcpKey: config.mcpKey };
}

export async function rotateMcpKey() {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");

    const newKey = crypto.randomUUID();
    await db.update(userPreferences)
        .set({ 
            mcpKey: newKey,
            updatedAt: new Date()
        })
        .where(eq(userPreferences.userId, userId));

    revalidatePath("/dashboard/mcp");
    return { mcpKey: newKey };
}
