"use server"

import { db } from "@/db";
import { videoJournals, audioJournals, journals } from "@/db/schema";
import { resolveUserId } from "./auth-sync";
import { eq, desc, asc, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { logDatabaseIssue } from "@/lib/db/errors";
import { composio } from "@/lib/composio";
import { getComposioActiveApps } from "./composio";

// Video Journal Actions

/**
 * Uploads a file to Google Drive in the 'debo' folder.
 */
export async function uploadMediaToDrive(params: {
    userId?: string;
    fileContent: string; // Base64 or URL
    fileName: string;
    mimeType: string;
}) {
    try {
        const resolvedUserId = await resolveUserId(params.userId, true);
        if (!resolvedUserId) {
            return { success: false, error: "Unauthorized" };
        }

        // 0. Verify Google Drive connection
        const activeApps = await getComposioActiveApps();
        if (!activeApps.includes("googledrive")) {
            return { success: false, error: "Google Drive is not connected via Composio" };
        }

        // 1. Ensure 'debo' folder exists
        const searchResult = await composio.tools.execute("GOOGLEDRIVE_SEARCH_FILES", {
            userId: resolvedUserId,
            arguments: {
                query: "name = 'debo' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
            }
        });

        let folderId: string;
        if (searchResult.items && searchResult.items.length > 0) {
            folderId = searchResult.items[0].id;
        } else {
            const createResult = await composio.tools.execute("GOOGLEDRIVE_CREATE_A_NEW_FOLDER", {
                userId: resolvedUserId,
                arguments: {
                    name: "debo"
                }
            });
            folderId = (createResult as any).id;
        }

        // 2. Upload file
        const uploadResult = await composio.tools.execute("GOOGLEDRIVE_UPLOAD_A_FILE_TO_GOOGLE_DRIVE", {
            userId: resolvedUserId,
            arguments: {
                name: params.fileName,
                file_to_upload: params.fileContent,
                parent: folderId
            }
        });

        return {
            success: true,
            driveFileId: (uploadResult as any).id,
            driveWebUrl: (uploadResult as any).webViewLink
        };
    } catch (error) {
        console.error("Failed to upload to Drive:", error);
        return { success: false, error: "Failed to upload to Google Drive" };
    }
}

export const getVideoJournals = cache(async (
    sortOrder: "asc" | "desc" = "desc",
    limit: number = 20,
    offset: number = 0,
    userId?: string
) => {
    const resolvedUserId = await resolveUserId(userId, true);
    if (!resolvedUserId) return [];

    try {
        return await db.query.videoJournals.findMany({
            where: eq(videoJournals.userId, resolvedUserId),
            orderBy: [sortOrder === "desc" ? desc(videoJournals.createdAt) : asc(videoJournals.createdAt)],
            limit,
            offset
        });
    } catch (error) {
        logDatabaseIssue("video journals list", error);
        return [];
    }
});

export const getVideoJournal = cache(async (id: string, userId?: string) => {
    const resolvedUserId = await resolveUserId(userId, true);
    if (!resolvedUserId) return null;

    try {
        return await db.query.videoJournals.findFirst({
            where: and(eq(videoJournals.id, id), eq(videoJournals.userId, resolvedUserId)),
        }) || null;
    } catch (error) {
        logDatabaseIssue("video journal read", error);
        return null;
    }
});

export async function saveVideoJournal(params: {
    id?: string;
    title: string;
    driveFileId: string;
    driveWebUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    transcript?: string;
    folderId?: string;
    userId?: string;
}) {
    try {
        const resolvedUserId = await resolveUserId(params.userId, true);
        if (!resolvedUserId) return { success: false, error: "Unauthorized" };

        const journalId = params.id || crypto.randomUUID();

        if (params.id) {
            await db.update(videoJournals).set({
                title: params.title,
                driveFileId: params.driveFileId,
                driveWebUrl: params.driveWebUrl,
                thumbnailUrl: params.thumbnailUrl,
                duration: params.duration,
                transcript: params.transcript,
                folderId: params.folderId,
                updatedAt: new Date()
            }).where(eq(videoJournals.id, params.id));
        } else {
            await db.insert(videoJournals).values({
                id: journalId,
                userId: resolvedUserId,
                title: params.title,
                driveFileId: params.driveFileId,
                driveWebUrl: params.driveWebUrl,
                thumbnailUrl: params.thumbnailUrl,
                duration: params.duration,
                transcript: params.transcript,
                folderId: params.folderId,
            });
        }

        revalidatePath("/dashboard/journals");
        return { success: true, data: journalId };
    } catch (error) {
        logDatabaseIssue("video journal save", error);
        return { success: false, error: "Failed to save video journal" };
    }
}

export async function deleteVideoJournal(id: string, userId?: string) {
    try {
        const resolvedUserId = await resolveUserId(userId, true);
        if (!resolvedUserId) return { success: false, error: "Unauthorized" };

        const existing = await getVideoJournal(id, resolvedUserId);
        if (!existing) return { success: false, error: "Video journal not found" };

        await db.delete(videoJournals).where(eq(videoJournals.id, id));

        revalidatePath("/dashboard/journals");
        return { success: true };
    } catch (error) {
        logDatabaseIssue("video journal delete", error);
        return { success: false, error: "Failed to delete video journal" };
    }
}

// Audio Journal Actions

export const getAudioJournals = cache(async (
    sortOrder: "asc" | "desc" = "desc",
    limit: number = 20,
    offset: number = 0,
    userId?: string
) => {
    const resolvedUserId = await resolveUserId(userId, true);
    if (!resolvedUserId) return [];

    try {
        return await db.query.audioJournals.findMany({
            where: eq(audioJournals.userId, resolvedUserId),
            orderBy: [sortOrder === "desc" ? desc(audioJournals.createdAt) : asc(audioJournals.createdAt)],
            limit,
            offset
        });
    } catch (error) {
        logDatabaseIssue("audio journals list", error);
        return [];
    }
});

export const getAudioJournal = cache(async (id: string, userId?: string) => {
    const resolvedUserId = await resolveUserId(userId, true);
    if (!resolvedUserId) return null;

    try {
        return await db.query.audioJournals.findFirst({
            where: and(eq(audioJournals.id, id), eq(audioJournals.userId, resolvedUserId)),
        }) || null;
    } catch (error) {
        logDatabaseIssue("audio journal read", error);
        return null;
    }
});

export async function saveAudioJournal(params: {
    id?: string;
    title: string;
    driveFileId: string;
    driveWebUrl?: string;
    transcript?: string;
    duration?: number;
    folderId?: string;
    userId?: string;
}) {
    try {
        const resolvedUserId = await resolveUserId(params.userId, true);
        if (!resolvedUserId) return { success: false, error: "Unauthorized" };

        const journalId = params.id || crypto.randomUUID();

        if (params.id) {
            await db.update(audioJournals).set({
                title: params.title,
                driveFileId: params.driveFileId,
                driveWebUrl: params.driveWebUrl,
                transcript: params.transcript,
                duration: params.duration,
                folderId: params.folderId,
                updatedAt: new Date()
            }).where(eq(audioJournals.id, params.id));
        } else {
            await db.insert(audioJournals).values({
                id: journalId,
                userId: resolvedUserId,
                title: params.title,
                driveFileId: params.driveFileId,
                driveWebUrl: params.driveWebUrl,
                transcript: params.transcript,
                duration: params.duration,
                folderId: params.folderId,
            });
        }

        revalidatePath("/dashboard/journals");
        return { success: true, data: journalId };
    } catch (error) {
        logDatabaseIssue("audio journal save", error);
        return { success: false, error: "Failed to save audio journal" };
    }
}

export async function deleteAudioJournal(id: string, userId?: string) {
    try {
        const resolvedUserId = await resolveUserId(userId, true);
        if (!resolvedUserId) return { success: false, error: "Unauthorized" };

        const existing = await getAudioJournal(id, resolvedUserId);
        if (!existing) return { success: false, error: "Audio journal not found" };

        await db.delete(audioJournals).where(eq(audioJournals.id, id));

        revalidatePath("/dashboard/journals");
        return { success: true };
    } catch (error) {
        logDatabaseIssue("audio journal delete", error);
        return { success: false, error: "Failed to delete audio journal" };
    }
}

// Combined journals with type indicator
export type JournalEntry = {
    id: string;
    type: "text" | "video" | "audio";
    title: string | null;
    content?: string;
    transcript?: string | null;
    createdAt: Date;
    updatedAt: Date;
    // Video/Audio specific
    driveWebUrl?: string | null;
    thumbnailUrl?: string | null;
    duration?: number | null;
};

export const getJournalEntry = cache(async (id: string, type: "text" | "video" | "audio" = "text", userId?: string) => {
    const resolvedUserId = await resolveUserId(userId, true);
    if (!resolvedUserId) return null;

    try {
        if (type === "text") {
            const j = await db.query.journals.findFirst({
                where: and(eq(journals.id, id), eq(journals.userId, resolvedUserId)),
            });
            return j ? { ...j, type: "text" as const } : null;
        } else if (type === "video") {
            const j = await db.query.videoJournals.findFirst({
                where: and(eq(videoJournals.id, id), eq(videoJournals.userId, resolvedUserId)),
            });
            return j ? { ...j, type: "video" as const } : null;
        } else {
            const j = await db.query.audioJournals.findFirst({
                where: and(eq(audioJournals.id, id), eq(audioJournals.userId, resolvedUserId)),
            });
            return j ? { ...j, type: "audio" as const } : null;
        }
    } catch (error) {
        logDatabaseIssue("journal entry read", error);
        return null;
    }
});

export const getAllJournals = cache(async (
    sortOrder: "asc" | "desc" = "desc",
    limit: number = 20,
    offset: number = 0,
    filter: "all" | "text" | "video" | "audio" = "all",
    userId?: string
) => {
    const resolvedUserId = await resolveUserId(userId, true);
    if (!resolvedUserId) return [];

    try {
        const results: JournalEntry[] = [];

        if (filter === "all" || filter === "text") {
            const textJournals = await db.query.journals.findMany({
                where: eq(journals.userId, resolvedUserId),
                orderBy: [sortOrder === "desc" ? desc(journals.createdAt) : asc(journals.createdAt)],
                limit,
                offset
            });

            results.push(...textJournals.map(j => ({
                id: j.id,
                type: "text" as const,
                title: j.title,
                content: j.content,
                createdAt: j.createdAt,
                updatedAt: j.updatedAt,
            })));
        }

        if (filter === "all" || filter === "video") {
            const videoJournalsData = await db.query.videoJournals.findMany({
                where: eq(videoJournals.userId, resolvedUserId),
                orderBy: [sortOrder === "desc" ? desc(videoJournals.createdAt) : asc(videoJournals.createdAt)],
                limit,
                offset
            });

            results.push(...videoJournalsData.map(j => ({
                id: j.id,
                type: "video" as const,
                title: j.title,
                transcript: j.transcript,
                driveWebUrl: j.driveWebUrl,
                thumbnailUrl: j.thumbnailUrl,
                duration: j.duration,
                createdAt: j.createdAt,
                updatedAt: j.updatedAt,
            })));
        }

        if (filter === "all" || filter === "audio") {
            const audioJournalsData = await db.query.audioJournals.findMany({
                where: eq(audioJournals.userId, resolvedUserId),
                orderBy: [sortOrder === "desc" ? desc(audioJournals.createdAt) : asc(audioJournals.createdAt)],
                limit,
                offset
            });

            results.push(...audioJournalsData.map(j => ({
                id: j.id,
                type: "audio" as const,
                title: j.title,
                transcript: j.transcript,
                driveWebUrl: j.driveWebUrl,
                duration: j.duration,
                createdAt: j.createdAt,
                updatedAt: j.updatedAt,
            })));
        }

        // Sort combined results
        results.sort((a, b) => {
            const comparison = a.createdAt.getTime() - b.createdAt.getTime();
            return sortOrder === "desc" ? -comparison : comparison;
        });

        return results.slice(0, limit);
    } catch (error) {
        logDatabaseIssue("all journals list", error);
        return [];
    }
});

export const getAllJournalsCount = cache(async (
    filter: "all" | "text" | "video" | "audio" = "all",
    userId?: string
) => {
    const resolvedUserId = await resolveUserId(userId, true);
    if (!resolvedUserId) return 0;

    try {
        let total = 0;

        if (filter === "all" || filter === "text") {
            const [textResult] = await db.select({ value: count() })
                .from(journals)
                .where(eq(journals.userId, resolvedUserId));
            total += textResult.value;
        }

        if (filter === "all" || filter === "video") {
            const [videoResult] = await db.select({ value: count() })
                .from(videoJournals)
                .where(eq(videoJournals.userId, resolvedUserId));
            total += videoResult.value;
        }

        if (filter === "all" || filter === "audio") {
            const [audioResult] = await db.select({ value: count() })
                .from(audioJournals)
                .where(eq(audioJournals.userId, resolvedUserId));
            total += audioResult.value;
        }

        return total;
    } catch (error) {
        logDatabaseIssue("all journals count", error);
        return 0;
    }
});

// Google Drive Connection
export async function connectGoogleDrive(userId: string, connectionId: string) {
    // Legacy sync connection disabled. 
    return {
        success: true,
        data: {
            connectionId,
            message: "Legacy sync is disabled. Agent tools are now used for Drive."
        }
    };
}

export async function getDriveConnectionStatus(userId: string) {
    // Nango is removed. Connection status should now be checked via Composio.
    return { connected: false, connectionId: null };
}

export async function syncGoogleDriveJournals(userId: string) {
    // Nango is removed. Syncing logic will be moved to Composio-based tools.
    return { success: false, error: "Legacy sync disabled. Use Agent Tools." };
}
