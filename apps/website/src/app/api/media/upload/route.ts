import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@debo/db";
import { sources, sourceFiles, voiceSessions, auditLogs, tasks, memoryItems } from "@debo/db/schema";
import {
  apiError,
  newId,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";
import { extractMemories } from "@/server/langgraph/graphs/extraction.graph";
import { indexSource } from "@/server/ingestion";
import path from "path";
import fs from "fs";
import { eq, and } from "drizzle-orm";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const ALLOWED_PREFIXES = ["image/", "audio/", "video/"];
const ALLOWED_EXACT = new Set(["application/pdf"]);

function isAllowedMime(mime: string): boolean {
  if (!mime) return false;
  if (ALLOWED_EXACT.has(mime)) return true;
  return ALLOWED_PREFIXES.some((p) => mime.startsWith(p));
}

function inferSourceType(mime: string): "image" | "audio" | "video" | "file" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  return "file";
}

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

let cachedClient: S3Client | null = null;
function getR2Client(accountId: string, accessKeyId: string, secret: string): S3Client {
  if (cachedClient) return cachedClient;
  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey: secret },
  });
  return cachedClient;
}

// Background transcription & memory extraction worker
async function processVoiceOrAudio(opts: {
  sourceId: string;
  userId: string;
  workspaceId: string;
  fileBuffer: Uint8Array;
  mimeType: string;
  filename: string;
}) {
  const { sourceId, userId, workspaceId, fileBuffer, mimeType } = opts;
  try {
    let transcriptText = "";
    if (process.env.DEEPGRAM_API_KEY) {
      console.log(`[media-upload] transcribing audio for ${sourceId} via Deepgram...`);
      const response = await fetch("https://api.deepgram.com/v1/listen?smart_format=true&model=nova-2", {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": mimeType || "application/octet-stream",
        },
        body: fileBuffer as any,
      });
      if (response.ok) {
        const data = await response.json();
        transcriptText = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
        console.log(`[media-upload] Deepgram transcription successful: "${transcriptText.slice(0, 60)}..."`);
      } else {
        console.error(`[media-upload] Deepgram request failed: ${response.status} ${response.statusText}`);
      }
    } else {
      console.warn(`[media-upload] DEEPGRAM_API_KEY not configured, skipping transcription.`);
    }

    if (transcriptText) {
      await db
        .update(sources)
        .set({ plainText: transcriptText, status: "ready" })
        .where(eq(sources.id, sourceId));
      
      // Index the plain text source
      await indexSource({
        sourceId,
        userId,
        workspaceId,
        plainText: transcriptText,
      });

      // Run LangGraph extractions
      console.log(`[media-upload] running memory extractions for source ${sourceId}...`);
      const extraction = await extractMemories({
        userId,
        sourceId,
        text: transcriptText,
      });

      // Insert extractions to database
      for (const memory of extraction.memories) {
        if (memory.type === "task_hint" || memory.type === "promise" || memory.type === "reminder") {
          const taskId = newId("task");
          await db.insert(tasks).values({
            id: taskId,
            userId,
            workspaceId,
            title: memory.title || "Extracted Task",
            description: memory.content,
            status: "inbox",
            extractionStatus: "extracted_pending",
            sourceId,
          }).catch((err) => console.error("[media-upload] failed to insert task:", err));
        } else {
          const memoryItemId = newId("mem");
          await db.insert(memoryItems).values({
            id: memoryItemId,
            userId,
            workspaceId,
            sourceId,
            type: memory.type === "summary" ? "summary" : (memory.type as any),
            title: memory.title || "Extracted Memory",
            content: memory.content,
            confidence: memory.confidence || 0.5,
            reviewStatus: "needs_review",
          }).catch((err) => console.error("[media-upload] failed to insert memory item:", err));
        }
      }
    }
  } catch (err) {
    console.error(`[media-upload] Error in background processing for source ${sourceId}:`, err);
  }
}

/**
 * POST /api/media/upload
 * multipart/form-data with `file` field. Uploads to Cloudflare R2 or falls back to public/uploads,
 * then creates source + source_files row.
 */
export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return apiError("invalid_form_data", 400);
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return apiError("file_required", 400);
    }

    if (file.size > MAX_BYTES) {
      return apiError("file_too_large", 413, { maxBytes: MAX_BYTES });
    }

    const mimeType = file.type || "application/octet-stream";
    if (!isAllowedMime(mimeType)) {
      return apiError("unsupported_mime_type", 415, { mimeType });
    }

    const customType = formData.get("type") as string | null;
    const sourceType = customType || inferSourceType(mimeType);
    const voiceSessionId = formData.get("voiceSessionId") as string | null;

    const r2 = getR2Config();
    let r2BucketValue: string;
    let r2KeyValue: string;

    const sourceId = newId("src");
    const fileId = newId("file");
    const safeName = `${Date.now()}_${file.name.replace(/[^\w.\-]+/g, "_")}`;

    const arrayBuffer = await file.arrayBuffer();
    const body = new Uint8Array(arrayBuffer);

    if (!r2) {
      // Local fallback to public/uploads
      console.log(`[media-upload] R2 is not configured. Falling back to public/uploads storage.`);
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, safeName);
      fs.writeFileSync(filePath, body);

      r2BucketValue = "local-dev-fallback";
      r2KeyValue = `/uploads/${safeName}`;
    } else {
      r2BucketValue = r2.bucket;
      r2KeyValue = `users/${user.id}/${sourceId}/${safeName}`;

      const client = getR2Client(r2.accountId, r2.accessKeyId, r2.secretAccessKey);
      await client.send(
        new PutObjectCommand({
          Bucket: r2.bucket,
          Key: r2KeyValue,
          Body: body,
          ContentType: mimeType,
          ContentLength: file.size,
        }),
      );
    }

    const [createdSource] = await db
      .insert(sources)
      .values({
        id: sourceId,
        userId: user.id,
        workspaceId,
        type: sourceType as any,
        title: file.name,
        status: (sourceType === "audio" || sourceType === "voice") ? "processing" : "ready",
        origin: "upload",
      })
      .returning();

    const [createdFile] = await db
      .insert(sourceFiles)
      .values({
        id: fileId,
        userId: user.id,
        workspaceId,
        sourceId,
        r2Bucket: r2BucketValue,
        r2Key: r2KeyValue,
        filename: file.name,
        mimeType,
        sizeBytes: file.size,
        uploadStatus: "uploaded",
      })
      .returning();

    // Trigger background process for voice & audio transcriptions
    if (sourceType === "audio" || sourceType === "voice") {
      const nowStr = new Date().toISOString();
      if (voiceSessionId) {
        await db.update(voiceSessions)
          .set({
            sourceId,
            status: "completed",
            endedAt: nowStr,
          })
          .where(and(eq(voiceSessions.id, voiceSessionId), eq(voiceSessions.userId, user.id)))
          .catch((err) => console.error("[media-upload] voiceSessions update failed:", err));
      } else {
        await db.insert(voiceSessions).values({
          id: newId("vs"),
          userId: user.id,
          workspaceId,
          sourceId,
          roomName: file.name,
          status: "completed",
          startedAt: nowStr,
          endedAt: nowStr,
          durationSeconds: 0,
        }).catch((err) => console.error("[media-upload] voiceSessions insert failed:", err));
      }

      processVoiceOrAudio({
        sourceId,
        userId: user.id,
        workspaceId,
        fileBuffer: body,
        mimeType,
        filename: file.name,
      }).catch((err) => console.error("[media-upload] bg process call error:", err));
    }

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "media.upload",
      targetType: "source",
      targetId: sourceId,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify({ mimeType, size: file.size, filename: file.name, r2Bucket: r2BucketValue }),
    });

    return NextResponse.json(
      {
        id: createdSource!.id,
        sourceId: createdSource!.id,
        fileId: createdFile!.id,
        mimeType,
        size: file.size,
      },
      { status: 201 },
    );
  });
}
