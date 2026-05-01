"use server";

import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { stackServerApp } from "@/stack/server";
import { eq } from "drizzle-orm";

export async function rotateMCPKey() {
  const user = await stackServerApp.getUser();
  if (!user) throw new Error("Unauthorized");

  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const newKey = `debo_${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;

  await db
    .insert(userPreferences)
    .values({
      userId: user.id,
      mcpKey: newKey,
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: {
        mcpKey: newKey,
        updatedAt: new Date(),
      },
    });

  return newKey;
}

export async function getMCPConfig() {
  const user = await stackServerApp.getUser();
  if (!user) throw new Error("Unauthorized");

  const config = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, user.id),
  });

  return config;
}
