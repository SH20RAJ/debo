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
 * Lightweight helper to get the current authenticated user ID from Stack Auth.
 * Does NOT perform any database synchronization.
 */
export async function getUserId(): Promise<string | null> {
    const stackUser = await stackServerApp.getUser();
    return stackUser?.id || null;
}

/**
 * Resolves the user ID and optionally synchronizes the user from Stack Auth to the local database.
 * @param skipSync If true, skips the database synchronization logic (useful for frequent calls like middleware).
 */
export async function resolveUserId(providedUserId?: string, skipSync = false): Promise<string | null> {
    const stackUser = await stackServerApp.getUser();
    const id = providedUserId || stackUser?.id;
    
    if (!id) return null;

    if (skipSync) return id;

    // If we have a stackUser object, sync it to our local DB
    if (stackUser) {
        try {
            const email = stackUser.primaryEmail || "";
            
            // 1. Check for email conflicts (same email, different ID)
            const conflict = await db.query.user.findFirst({
                where: eq(userTable.email, email),
            });

            if (conflict && conflict.id !== stackUser.id) {
                const oldId = conflict.id;
                const newId = stackUser.id;
                
                console.log(`[AuthSync] Migrating user ${email} from ${oldId} to ${newId}`);
                
                await db.transaction(async (tx) => {
                    // Check if newId already exists
                    const existingNew = await tx.query.user.findFirst({
                        where: eq(userTable.id, newId),
                    });

                    if (!existingNew) {
                        // Create temporary record for newId to receive foreign keys
                        await tx.insert(userTable).values({
                            id: newId,
                            name: stackUser.displayName || email.split("@")[0] || "User",
                            email: `${email}.temp-${Date.now()}`,
                            emailVerified: stackUser.primaryEmailVerified || false,
                            image: stackUser.profileImageUrl || null,
                            createdAt: conflict.createdAt,
                            updatedAt: new Date(),
                        });
                    }

                    // Move all data to newId
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

                    // Delete old record
                    await tx.delete(userTable).where(eq(userTable.id, oldId));

                    // Finalize email on new record
                    await tx.update(userTable).set({ 
                        email: email,
                        updatedAt: new Date()
                    }).where(eq(userTable.id, newId));
                });
                
                console.log(`[AuthSync] Migration complete for ${email}`);
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
            console.error("[AuthSync] Error syncing user:", error);
        }
    }

    return id;
}
