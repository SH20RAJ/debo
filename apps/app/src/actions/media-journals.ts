"use server"

import { db } from "@debo/db";
import { videoJournals, audioJournals, journals } from "@debo/db/schema";
import { resolveUserId } from "./auth-sync";
import { eq, desc, asc, and, count, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { logDatabaseIssue } from "@debo/db/errors";
import { generateText } from "ai";
import { getChatModel } from "@debo/ai/openai";

// Video Journal Actions

type DriveUploadResult = {
    success: boolean;
    driveFileId?: string;
    driveWebUrl?: string;
    folderId?: string;
    folderPath?: string;
    error?: string;
};

type DriveRecord = Record<string, unknown> & {
    data?: unknown;
    files?: DriveRecord[];
    folders?: DriveRecord[];
    id?: string;
    items?: DriveRecord[];
    name?: string;
    webContentLink?: string;
    webViewLink?: string;
};

type ComposioProxyClient = {
    tools?: {
        proxy?: (params: {
            binary_body?: { base64: string; content_type: string };
            body?: unknown;
            connected_account_id: string;
            endpoint: string;
            method: "GET" | "POST" | "PATCH" | "DELETE";
            parameters?: Array<{ name: string; in: "query" | "header"; value: string }>;
        }) => Promise<{ data: unknown; status: number }>;
    };
};

function isDriveRecord(value: unknown): value is DriveRecord {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function unwrapDriveData(result: unknown) {
    return isDriveRecord(result) && "data" in result ? result.data : result;
}

function extractDriveItems(result: unknown): DriveRecord[] {
    const data = unwrapDriveData(result);
    if (Array.isArray(data)) return data.filter(isDriveRecord);
    if (!isDriveRecord(data)) return [];
    if (Array.isArray(data.files)) return data.files;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.folders)) return data.folders;
    if (data.id) return [data];
    return [];
}

function extractDriveFile(result: unknown) {
    const data = unwrapDriveData(result);
    if (Array.isArray(data)) return data.find(isDriveRecord) || null;
    return isDriveRecord(data) ? data : null;
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
    const client = (composio as unknown as { client?: ComposioProxyClient }).client;

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
            type: parameter.in,
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

    try {
        await makeDrivePublic(connectedAccountId, folderId);
    } catch (e) {
        console.warn(`[DriveFolder] Could not set public permission on folder "${cleanName}":`, e);
    }

    return folderId as string;
}

async function makeDrivePublic(connectedAccountId: string, fileId: string) {
    return proxyGoogleDrive(connectedAccountId, {
        endpoint: `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        method: "POST",
        body: {
            role: "reader",
            type: "anyone",
        },
        parameters: [{ name: "fields", in: "query", value: "id" }],
    });
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

        if (!driveData?.id) {
            return { success: false, error: "Upload succeeded but no file ID returned" };
        }

        try {
            await makeDrivePublic(driveConnectionId, driveData.id);
        } catch (e) {
            console.warn(`[DriveUpload] Could not set public permission on file:`, e);
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

        void captureMediaCharacterMentions(resolvedUserId, {
            id: journalId,
            type: "video",
            title: params.title,
            text: params.transcript || params.title,
        });

        revalidateJournalSurfaces("video", journalId);
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

        revalidateJournalSurfaces("video", id);
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

        void captureMediaCharacterMentions(resolvedUserId, {
            id: journalId,
            type: "audio",
            title: params.title,
            text: params.transcript || params.title,
        });

        revalidateJournalSurfaces("audio", journalId);
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

        revalidateJournalSurfaces("audio", id);
        return { success: true };
    } catch (error) {
        logDatabaseIssue("audio journal delete", error);
        return { success: false, error: "Failed to delete audio journal" };
    }
}

async function captureMediaCharacterMentions(
    userId: string,
    source: { id: string; type: "audio" | "video"; title: string; text: string }
) {
    try {
        const { captureCharacterMentionsFromText } = await import("@/features/characters/actions");
        await captureCharacterMentionsFromText({
            userId,
            text: source.text,
            title: source.title,
            sourceType: source.type,
            sourceId: source.id,
        });
    } catch (error) {
        console.warn("[Characters] Media mention capture failed:", error);
    }
}

// Combined journals with type indicator
export type JournalEntry = {
    id: string;
    type: "text" | "video" | "audio";
    title: string | null;
    content?: string;
    transcript?: string | null;
    tags?: string[] | null;
    createdAt: Date;
    updatedAt: Date;
    // Video/Audio specific
    driveWebUrl?: string | null;
    thumbnailUrl?: string | null;
    duration?: number | null;
};

export type JournalFilter = "all" | "text" | "video" | "audio";
export type JournalSortBy = "createdAt" | "updatedAt" | "title";

function normalizeJournalQuery(query?: string) {
    return query?.replace(/\s+/g, " ").trim() || "";
}

function journalText(entry: JournalEntry) {
    return `${entry.title || ""} ${entry.content || ""} ${entry.transcript || ""}`.toLowerCase();
}

function compareJournals(sortOrder: "asc" | "desc", sortBy: JournalSortBy) {
    return (a: JournalEntry, b: JournalEntry) => {
        let comparison = 0;

        if (sortBy === "title") {
            comparison = (a.title || "Untitled").localeCompare(b.title || "Untitled", undefined, {
                sensitivity: "base",
            });
        } else {
            const aValue = sortBy === "updatedAt" ? a.updatedAt : a.createdAt;
            const bValue = sortBy === "updatedAt" ? b.updatedAt : b.createdAt;
            comparison = aValue.getTime() - bValue.getTime();
        }

        return sortOrder === "desc" ? -comparison : comparison;
    };
}

function revalidateJournalSurfaces(type?: JournalEntry["type"], id?: string) {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/journals");
    if (type && id) {
        revalidatePath(`/dashboard/journal/${type}/${id}`);
    }
}

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
    filter: JournalFilter = "all",
    userId?: string,
    query?: string,
    sortBy: JournalSortBy = "createdAt"
) => {
    const resolvedUserId = await resolveUserId(userId, true);
    if (!resolvedUserId) return [];

    try {
        const results: JournalEntry[] = [];
        const normalizedQuery = normalizeJournalQuery(query);
        const pattern = `%${normalizedQuery}%`;
        const fetchLimit = Math.max(limit + offset, limit);
        const textOrder =
            sortBy === "title"
                ? sortOrder === "desc" ? desc(journals.title) : asc(journals.title)
                : sortBy === "updatedAt"
                    ? sortOrder === "desc" ? desc(journals.updatedAt) : asc(journals.updatedAt)
                    : sortOrder === "desc" ? desc(journals.createdAt) : asc(journals.createdAt);
        const videoOrder =
            sortBy === "title"
                ? sortOrder === "desc" ? desc(videoJournals.title) : asc(videoJournals.title)
                : sortBy === "updatedAt"
                    ? sortOrder === "desc" ? desc(videoJournals.updatedAt) : asc(videoJournals.updatedAt)
                    : sortOrder === "desc" ? desc(videoJournals.createdAt) : asc(videoJournals.createdAt);
        const audioOrder =
            sortBy === "title"
                ? sortOrder === "desc" ? desc(audioJournals.title) : asc(audioJournals.title)
                : sortBy === "updatedAt"
                    ? sortOrder === "desc" ? desc(audioJournals.updatedAt) : asc(audioJournals.updatedAt)
                    : sortOrder === "desc" ? desc(audioJournals.createdAt) : asc(audioJournals.createdAt);

        if (filter === "all" || filter === "text") {
            const textJournals = await db.query.journals.findMany({
                where: normalizedQuery
                    ? and(
                        eq(journals.userId, resolvedUserId),
                        or(ilike(journals.title, pattern), ilike(journals.content, pattern)),
                    )
                    : eq(journals.userId, resolvedUserId),
                orderBy: [textOrder],
                limit: fetchLimit,
                offset: 0
            });

            results.push(...textJournals.map(j => ({
                id: j.id,
                type: "text" as const,
                title: j.title,
                content: j.content,
                tags: j.tags,
                createdAt: j.createdAt,
                updatedAt: j.updatedAt,
            })));
        }

        if (filter === "all" || filter === "video") {
            const videoJournalsData = await db.query.videoJournals.findMany({
                where: normalizedQuery
                    ? and(
                        eq(videoJournals.userId, resolvedUserId),
                        or(ilike(videoJournals.title, pattern), ilike(videoJournals.transcript, pattern)),
                    )
                    : eq(videoJournals.userId, resolvedUserId),
                orderBy: [videoOrder],
                limit: fetchLimit,
                offset: 0
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
                where: normalizedQuery
                    ? and(
                        eq(audioJournals.userId, resolvedUserId),
                        or(ilike(audioJournals.title, pattern), ilike(audioJournals.transcript, pattern)),
                    )
                    : eq(audioJournals.userId, resolvedUserId),
                orderBy: [audioOrder],
                limit: fetchLimit,
                offset: 0
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

        const finalResults = normalizedQuery
            ? results.filter((entry) => journalText(entry).includes(normalizedQuery.toLowerCase()))
            : results;

        finalResults.sort(compareJournals(sortOrder, sortBy));

        return finalResults.slice(offset, offset + limit);
    } catch (error) {
        logDatabaseIssue("all journals list", error);
        return [];
    }
});

export const getAllJournalsCount = cache(async (
    filter: JournalFilter = "all",
    userId?: string,
    query?: string
) => {
    const resolvedUserId = await resolveUserId(userId, true);
    if (!resolvedUserId) return 0;

    try {
        let total = 0;
        const normalizedQuery = normalizeJournalQuery(query);
        const pattern = `%${normalizedQuery}%`;

        if (filter === "all" || filter === "text") {
            const [textResult] = await db.select({ value: count() })
                .from(journals)
                .where(normalizedQuery
                    ? and(
                        eq(journals.userId, resolvedUserId),
                        or(ilike(journals.title, pattern), ilike(journals.content, pattern)),
                    )
                    : eq(journals.userId, resolvedUserId));
            total += textResult.value;
        }

        if (filter === "all" || filter === "video") {
            const [videoResult] = await db.select({ value: count() })
                .from(videoJournals)
                .where(normalizedQuery
                    ? and(
                        eq(videoJournals.userId, resolvedUserId),
                        or(ilike(videoJournals.title, pattern), ilike(videoJournals.transcript, pattern)),
                    )
                    : eq(videoJournals.userId, resolvedUserId));
            total += videoResult.value;
        }

        if (filter === "all" || filter === "audio") {
            const [audioResult] = await db.select({ value: count() })
                .from(audioJournals)
                .where(normalizedQuery
                    ? and(
                        eq(audioJournals.userId, resolvedUserId),
                        or(ilike(audioJournals.title, pattern), ilike(audioJournals.transcript, pattern)),
                    )
                    : eq(audioJournals.userId, resolvedUserId));
            total += audioResult.value;
        }

        return total;
    } catch (error) {
        logDatabaseIssue("all journals count", error);
        return 0;
    }
});

export async function renameJournalEntry(params: {
    id: string;
    type: JournalEntry["type"];
    title: string;
    userId?: string;
}) {
    try {
        const resolvedUserId = await resolveUserId(params.userId, true);
        if (!resolvedUserId) return { success: false, error: "Unauthorized" };

        const title = params.title.replace(/\s+/g, " ").trim().slice(0, 180);
        if (!title) return { success: false, error: "Title is required" };

        const existing = await getJournalEntry(params.id, params.type, resolvedUserId);
        if (!existing) return { success: false, error: "Journal not found" };

        if (params.type === "text") {
            await db.update(journals).set({
                title,
                updatedAt: new Date(),
            }).where(and(eq(journals.id, params.id), eq(journals.userId, resolvedUserId)));
        } else if (params.type === "video") {
            await db.update(videoJournals).set({
                title,
                updatedAt: new Date(),
            }).where(and(eq(videoJournals.id, params.id), eq(videoJournals.userId, resolvedUserId)));
        } else {
            await db.update(audioJournals).set({
                title,
                updatedAt: new Date(),
            }).where(and(eq(audioJournals.id, params.id), eq(audioJournals.userId, resolvedUserId)));
        }

        revalidateJournalSurfaces(params.type, params.id);
        return { success: true };
    } catch (error) {
        logDatabaseIssue("journal rename", error);
        return { success: false, error: "Failed to rename journal" };
    }
}

export async function deleteJournalEntry(params: {
    id: string;
    type: JournalEntry["type"];
    userId?: string;
}) {
    if (params.type === "text") {
        const { deleteJournal } = await import("./journals");
        return deleteJournal(params.id, params.userId);
    }

    if (params.type === "video") {
        return deleteVideoJournal(params.id, params.userId);
    }

    return deleteAudioJournal(params.id, params.userId);
}

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

export async function getDriveConnectionStatus(_userId: string) {
    void _userId;
    // Nango is removed. Connection status should now be checked via Composio.
    return { connected: false, connectionId: null };
}

export async function syncGoogleDriveJournals(_userId: string) {
    void _userId;
    // Nango is removed. Syncing logic will be moved to Composio-based tools.
    return { success: false, error: "Legacy sync disabled. Use Agent Tools." };
}
