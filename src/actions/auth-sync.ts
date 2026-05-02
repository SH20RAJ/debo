import { db } from "@/db";
import { 
    user as userTable, 
    journals, 
    account, 
    session, 
    userPreferences, 
    chats, 
    aiProviders, 
    memoryEdges, 
    memoryEntities, 
    memoryFacts, 
    memoryNodes 
} from "@/db/schema";
import { stackServerApp } from "@/stack/server";
import { eq } from "drizzle-orm";

/**
 * Resolves the user ID from the session or the provided ID.
 * Automatically synchronizes the user from Stack Auth to the local database
 * to satisfy foreign key constraints.
 * Handles cases where the user's ID might have changed (e.g. migration) by merging data.
 */
export async function resolveUserId(providedUserId?: string): Promise<string | null> {
    const stackUser = await stackServerApp.getUser();
    const id = providedUserId || stackUser?.id;
    
    if (!id) return null;

    // If we have a stackUser object, sync it to our local DB
    if (stackUser) {
        try {
            // 1. Check if the user exists with this ID
            const existingById = await db.query.user.findFirst({
                where: eq(userTable.id, stackUser.id),
            });

            if (!existingById) {
                // 2. Check if the email exists with a different ID
                const existingByEmail = await db.query.user.findFirst({
                    where: eq(userTable.email, stackUser.primaryEmail || ""),
                });

                if (existingByEmail && existingByEmail.id !== stackUser.id) {
                    const oldId = existingByEmail.id;
                    const newId = stackUser.id;
                    
                    console.log(`[AuthSync] Migrating user ${stackUser.primaryEmail} from ${oldId} to ${newId}`);
                    
                    await db.transaction(async (tx) => {
                        // Update related tables to the new ID
                        await tx.update(journals).set({ userId: newId }).where(eq(journals.userId, oldId));
                        await tx.update(account).set({ userId: newId }).where(eq(account.userId, oldId));
                        await tx.update(session).set({ userId: newId }).where(eq(session.userId, oldId));
                        await tx.update(userPreferences).set({ userId: newId }).where(eq(userPreferences.userId, oldId));
                        await tx.update(chats).set({ userId: newId }).where(eq(chats.userId, oldId));
                        await tx.update(aiProviders).set({ userId: newId }).where(eq(aiProviders.userId, oldId));
                        await tx.update(memoryEdges).set({ userId: newId }).where(eq(memoryEdges.userId, oldId));
                        await tx.update(memoryEntities).set({ userId: newId }).where(eq(memoryEntities.userId, oldId));
                        await tx.update(memoryFacts).set({ userId: newId }).where(eq(memoryFacts.userId, oldId));
                        await tx.update(memoryNodes).set({ userId: newId }).where(eq(memoryNodes.userId, oldId));

                        // Create new user record with temp email to avoid constraint
                        const tempEmail = `${stackUser.primaryEmail}.temp-${Date.now()}`;
                        await tx.insert(userTable).values({
                            id: newId,
                            name: stackUser.displayName || stackUser.primaryEmail?.split("@")[0] || "User",
                            email: tempEmail,
                            emailVerified: stackUser.primaryEmailVerified || false,
                            image: stackUser.profileImageUrl || null,
                            createdAt: existingByEmail.createdAt,
                            updatedAt: new Date(),
                        });

                        // Delete old user record
                        await tx.delete(userTable).where(eq(userTable.id, oldId));

                        // Update new user record with correct email
                        await tx.update(userTable).set({ 
                            email: stackUser.primaryEmail || "",
                            updatedAt: new Date()
                        }).where(eq(userTable.id, newId));
                    });
                    
                    console.log(`[AuthSync] Migration complete for ${stackUser.primaryEmail}`);
                }
            }

            // Standard upsert for existing or brand new users
            await db.insert(userTable).values({
                id: stackUser.id,
                name: stackUser.displayName || stackUser.primaryEmail?.split("@")[0] || "User",
                email: stackUser.primaryEmail || "",
                emailVerified: stackUser.primaryEmailVerified || false,
                image: stackUser.profileImageUrl || null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }).onConflictDoUpdate({
                target: userTable.id,
                set: {
                    name: stackUser.displayName || stackUser.primaryEmail?.split("@")[0] || "User",
                    email: stackUser.primaryEmail || "",
                    emailVerified: stackUser.primaryEmailVerified || false,
                    image: stackUser.profileImageUrl || null,
                    updatedAt: new Date(),
                }
            });
        } catch (error) {
            console.error("[AuthSync] Failed to sync user to database:", error);
            // Continue as the user might already exist or DB might have issues
        }
    }

    return id;
}
