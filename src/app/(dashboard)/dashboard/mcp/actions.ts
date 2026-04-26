"use server";

import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { crypto } from "node:crypto";

export async function rotateMCPKey() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    const newKey = `debo_${crypto.randomBytes(24).toString("hex")}`;

    await db.update(userPreferences)
        .set({ mcpKey: newKey })
        .where(eq(userPreferences.userId, session.user.id));

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
