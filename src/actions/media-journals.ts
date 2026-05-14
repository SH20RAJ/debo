"use server"

import { db } from "@/db";
import { videoJournals, audioJournals, journals } from "@/db/schema";
import { resolveUserId } from "./auth-sync";
import { eq, desc, asc, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { logDatabaseIssue } from "@/lib/db/errors";
import { generateText } from "ai";
import { getChatModel } from "@/lib/ai/openai";

// Video Journal Actions

type DriveUploadResult = {
    success: boolean;
    driveFileId?: string;
    driveWebUrl?: string;
    folderId?: string;
    folderPath?: string;
    error?: string;
};

function extractDriveItems(result: unknown): any[] {
    const data = (result as any)?.data ?? result;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.files)) return data.files;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.folders)) return data.folders;
    if (data?.id) return [data];
    return [];
}

function extractDriveFile(result: unknown) {
    const data = (result as any)?.data ?? result;
    return Array.isArray(data) ? data[0] : data;
}

function sanitizeDriveName(value: string) {
    return value
        .replace(/[\\/:\*\?"<>\|\u0000-\u001f]/g, "-")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120) || "Untitled";
}

function escapeDriveQueryValue(value: string) {
    return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }

    return btoa(binary);
}

async function getGoogleDriveConnectionId() {
    const { getComposioActiveApps } = await import("./composio");
    const activeApps = await getComposioActiveApps();
    return activeApps.find((app) => app.slug === "googledrive")?.id || null;
}

async function proxyGoogleDrive<T>(
    connectedAccountId: string,
    params: {
        endpoint: string;
        method: "GET" | "POST" | "PATCH" | "DELETE";
        body?: unknown;
        binaryBody?: { base64: string; content_type: string };
        parameters?: Array<{ name: string; in: "query" | "header"; value: string }>;
    }
) {
    const { composio } = await import("@/lib/composio");
    const client = (composio as any).client;

    if (!client?.tools?.proxy) {
        throw new Error("Composio proxy is not available.");
    }

    const response = await client.tools.proxy({
        endpoint: params.endpoint,
        method: params.method,
        body: params.body,
        binary_body: params.binaryBody,
        connected_account_id: connectedAccountId,
        parameters: params.parameters?.map((parameter) => ({
            name: parameter.name,
            in: parameter.in,
            value: parameter.value,
        })),
    });

    if (response.status < 200 || response.status >= 300) {
        const message = typeof response.data === "string" ? response.data : JSON.stringify(response.data || {});
        throw new Error(`Google Drive request failed (${response.status}): ${message.slice(0, 300)}`);
    }

    return response.data as T;
}

function fallbackCaptureTitle(mediaType: string) {
    const now = new Date();
    const weekday = now.toLocaleDateString("en", { weekday: "long" });
    const date = now.toLocaleDateString("en", { month: "short", day: "numeric" });
    const label = mediaType === "video" ? "Video" : mediaType === "audio" ? "Audio" : "Capture";
    return `${weekday} ${label} Journal - ${date}`;
}

export async function generateCaptureTitle(params: {
    description?: string;
    mediaType?: "audio" | "video" | "image";
    duration?: number;
}) {
    const description = params.description?.replace(/\s+/g, " ").trim() || "";
    const mediaType = params.mediaType || "audio";
    const fallback = fallbackCaptureTitle(mediaType);

    if (description.length < 8) {
        return { success: true, title: fallback };
    }

    try {
        const result = await generateText({
            model: getChatModel(),
            system: "You write short, plain journal titles. Return only the title. No quotes. No punctuation at the end unless needed.",
            prompt: `Create a clear 3-7 word title for this ${mediaType} journal. Use the user's description and recording metadata.\n\nDescription: ${description}\nDuration: ${params.duration || 0} seconds`,
        });

        const title = result.text
            .replace(/["']/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 80);

        return { success: true, title: title || fallback };
    } catch (error) {
        console.warn("[CaptureTitle] Falling back to date title:", error);
        return { success: true, title: fallback };
    }
}

async function findDriveFolder(connectedAccountId: string, name: string, parentId?: string) {
    const escapedName = escapeDriveQueryValue(name);
    const parentClause = parentId ? ` and '${escapeDriveQueryValue(parentId)}' in parents` : "";
    const result = await proxyGoogleDrive<{ files?: Array<{ id?: string; name?: string }> }>(connectedAccountId, {
        endpoint: "https://www.googleapis.com/drive/v3/files",
        method: "GET",
        parameters: [
            {
                name: "q",
                in: "query",
                value: `name='${escapedName}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parentClause}`,
            },
            { name: "fields", in: "query", value: "files(id,name)" },
            { name: "pageSize", in: "query", value: "1" },
        ],
    });

    return extractDriveItems(result).find((item) => item?.id);
}

async function ensureDriveFolder(connectedAccountId: string, name: string, parentId?: string) {
    const cleanName = sanitizeDriveName(name);
    const existing = await findDriveFolder(connectedAccountId, cleanName, parentId);
    if (existing?.id) return existing.id as string;

    const result = await proxyGoogleDrive<{ id?: string }>(connectedAccountId, {
        endpoint: "https://www.googleapis.com/drive/v3/files",
        method: "POST",
        body: {
            name: cleanName,
            mimeType: "application/vnd.google-apps.folder",
            ...(parentId ? { parents: [parentId] } : {}),
        },
        parameters: [{ name: "fields", in: "query", value: "id" }],
    });

    const created = extractDriveFile(result);
    const folderId = created?.id;
    if (!folderId) {
        throw new Error(`Could not create Google Drive folder "${cleanName}"`);
    }

    return folderId as string;
}

async function uploadDriveFile(
    connectedAccountId: string,
    file: File,
    fileName: string,
    folderId: string
) {
    const boundary = `debo_${crypto.randomUUID().replace(/-/g, "")}`;
    const metadata = JSON.stringify({
        name: fileName,
        parents: [folderId],
    });
    const contentType = file.type || "application/octet-stream";
    const fileBuffer = await file.arrayBuffer();
    const multipartBuffer = await new Blob([
        `--${boundary}\r\n`,
        "Content-Type: application/json; charset=UTF-8\r\n\r\n",
        metadata,
        `\r\n--${boundary}\r\n`,
        `Content-Type: ${contentType}\r\n\r\n`,
        fileBuffer,
        `\r\n--${boundary}--`,
    ]).arrayBuffer();

    return proxyGoogleDrive<{ id?: string; webViewLink?: string; webContentLink?: string }>(connectedAccountId, {
        endpoint: "https://www.googleapis.com/upload/drive/v3/files",
        method: "POST",
        binaryBody: {
            base64: arrayBufferToBase64(multipartBuffer),
            content_type: `multipart/related; boundary=${boundary}`,
        },
        parameters: [
            { name: "uploadType", in: "query", value: "multipart" },
            { name: "fields", in: "query", value: "id,webViewLink,webContentLink" },
        ],
    });
}

/**
 * Uploads media to an organized Google Drive path:
 * Debo/{Audio Journals|Video Journals}/YYYY-MM
 */
export async function uploadMediaToDrive(formData: FormData) : Promise<DriveUploadResult> {
    try {
        const userId = formData.get("userId") as string;
        const file = formData.get("file") as File;
        const fileName = sanitizeDriveName((formData.get("fileName") as string) || file?.name || "media.webm");
        const mediaType = formData.get("mediaType") === "video" ? "video" : "audio";

        if (!file) {
            return { success: false, error: "No file provided" };
        }

        const resolvedUserId = await resolveUserId(userId, true);
        if (!resolvedUserId) {
            return { success: false, error: "Unauthorized" };
        }

        const driveConnectionId = await getGoogleDriveConnectionId();
        if (!driveConnectionId) {
            return { success: false, error: "Google Drive is not connected via Composio" };
        }

        const now = new Date();
        const monthFolder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const libraryFolder = mediaType === "video" ? "Video Journals" : "Audio Journals";
        const rootFolderId = await ensureDriveFolder(driveConnectionId, "Debo");
        const libraryFolderId = await ensureDriveFolder(driveConnectionId, libraryFolder, rootFolderId);
        const folderId = await ensureDriveFolder(driveConnectionId, monthFolder, libraryFolderId);
        const folderPath = `Debo/${libraryFolder}/${monthFolder}`;

        const driveData = extractDriveFile(await uploadDriveFile(driveConnectionId, file, fileName, folderId));

        if (!driveData.id) {
            return { success: false, error: "Upload succeeded but no file ID returned" };
        }

        return {
            success: true,
            driveFileId: driveData.id,
            driveWebUrl: driveData.webViewLink || driveData.webContentLink || `https://drive.google.com/file/d/${driveData.id}/view`,
            folderId,
            folderPath,
        };
    } catch (error) {
        console.error("[DriveUpload] EXCEPTION:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to upload to Google Drive" 
        };
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

export const getJournalEntry = cache(async <T extends "text" | "video" | "audio">(id: string, type: T = "text" as T, userId?: string) => {
    const resolvedUserId = await resolveUserId(userId, true);
    if (!resolvedUserId) return null;

    try {
        if (type === "text") {
            const j = await db.query.journals.findFirst({
                where: and(eq(journals.id, id), eq(journals.userId, resolvedUserId)),
            });
            return j ? ({ ...j, type: "text" as const } as unknown as JournalEntry & { type: T }) : null;
        } else if (type === "video") {
            const j = await db.query.videoJournals.findFirst({
                where: and(eq(videoJournals.id, id), eq(videoJournals.userId, resolvedUserId)),
            });
            return j ? ({ ...j, type: "video" as const } as unknown as JournalEntry & { type: T }) : null;
        } else {
            const j = await db.query.audioJournals.findFirst({
                where: and(eq(audioJournals.id, id), eq(audioJournals.userId, resolvedUserId)),
            });
            return j ? ({ ...j, type: "audio" as const } as unknown as JournalEntry & { type: T }) : null;
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
