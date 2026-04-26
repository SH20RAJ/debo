"use server";

import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export async function rotateMCPKey() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    const newKey = `debo_${crypto.randomBytes(24).toString("hex")}`;

    await db.insert(userPreferences)
        .values({ 
            userId: session.user.id,
            mcpKey: newKey 
        })
        .onConflictDoUpdate({
            target: userPreferences.userId,
            set: { 
                mcpKey: newKey, 
                updatedAt: new Date() 
            }
        });

    return newKey;
}

export async function getMCPConfig() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    const config = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, session.user.id)
    });

    return config;
}
