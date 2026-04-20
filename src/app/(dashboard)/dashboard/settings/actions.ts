"use server"

import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getUserPreferences() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    const prefs = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, session.user.id),
    });

    return prefs;
}

export async function saveUserPreferences(data: { openaiKey?: string, anthropicKey?: string }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    const existing = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, session.user.id),
    });

    if (existing) {
        await db.update(userPreferences).set({
            openaiKey: data.openaiKey || null,
            anthropicKey: data.anthropicKey || null,
            updatedAt: new Date()
        }).where(eq(userPreferences.userId, session.user.id));
    } else {
        await db.insert(userPreferences).values({
            userId: session.user.id,
            openaiKey: data.openaiKey || null,
            anthropicKey: data.anthropicKey || null,
        });
    }

    revalidatePath("/dashboard/settings");
    return true;
}
