import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "@debo/db";
import { sourceFiles, auditLogs } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import {
  apiError,
  newId,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";

const URL_TTL_SECONDS = 5 * 60;

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
 * GET /api/sources/:id/file
 * Returns a short-lived signed URL for the user's uploaded R2 file.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { id } = await params;

    const [file] = await db
      .select()
      .from(sourceFiles)
      .where(
        and(
          eq(sourceFiles.sourceId, id),
          eq(sourceFiles.userId, user.id),
          eq(sourceFiles.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    if (!file) return apiError("not_found", 404);

    const r2 = getR2Config();
    if (!r2) {
      return apiError("r2_not_configured", 503, { service: "r2" });
    }

    const client = getR2Client(r2.accountId, r2.accessKeyId, r2.secretAccessKey);
    // Cast: duplicate @smithy/smithy-client versions in the workspace cause a
    // structural type mismatch even though the runtime client is compatible.
    const url = await getSignedUrl(
      client as unknown as Parameters<typeof getSignedUrl>[0],
      new GetObjectCommand({ Bucket: file.r2Bucket, Key: file.r2Key }),
      { expiresIn: URL_TTL_SECONDS },
    );

    const expiresAt = new Date(Date.now() + URL_TTL_SECONDS * 1000).toISOString();

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "source.file_url_issued",
      targetType: "source",
      targetId: id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify({
        fileId: file.id,
        expiresAt,
        ttlSeconds: URL_TTL_SECONDS,
      }),
    });

    return NextResponse.json({
      url,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      filename: file.filename,
      expiresAt,
    });
  });
}
