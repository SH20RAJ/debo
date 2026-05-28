import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@debo/db";
import { sources, sourceFiles, auditLogs } from "@debo/db/schema";
import {
  apiError,
  newId,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";

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

/**
 * POST /api/media/upload
 * multipart/form-data with `file` field. Uploads to Cloudflare R2 and
 * creates a source + source_files row. Returns 503 if R2 isn't configured.
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

    const r2 = getR2Config();
    if (!r2) {
      return apiError("r2_not_configured", 503, { service: "r2" });
    }

    const sourceId = newId("src");
    const fileId = newId("file");
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const r2Key = `users/${user.id}/${sourceId}/${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const body = new Uint8Array(arrayBuffer);

    const client = getR2Client(r2.accountId, r2.accessKeyId, r2.secretAccessKey);
    await client.send(
      new PutObjectCommand({
        Bucket: r2.bucket,
        Key: r2Key,
        Body: body,
        ContentType: mimeType,
        ContentLength: file.size,
      }),
    );

    const sourceType = inferSourceType(mimeType);

    const [createdSource] = await db
      .insert(sources)
      .values({
        id: sourceId,
        userId: user.id,
        workspaceId,
        type: sourceType,
        title: file.name,
        status: "ready",
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
        r2Bucket: r2.bucket,
        r2Key,
        filename: file.name,
        mimeType,
        sizeBytes: file.size,
        uploadStatus: "uploaded",
      })
      .returning();

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "media.upload",
      targetType: "source",
      targetId: sourceId,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify({ mimeType, size: file.size, filename: file.name }),
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
