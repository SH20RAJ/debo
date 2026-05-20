import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getR2Config() {
  return {
    accountId: requireEnv("R2_ACCOUNT_ID"),
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    bucketName: requireEnv("R2_BUCKET_NAME"),
  };
}

/** Returns true if all required R2 environment variables are set. */
export function isR2Configured(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
}

// ---------------------------------------------------------------------------
// S3 client (R2-compatible)
// ---------------------------------------------------------------------------

let _client: S3Client | undefined;

/** Return a cached S3Client pointing at the Cloudflare R2 endpoint. */
export function getR2Client(): S3Client {
  if (_client) return _client;

  const { accountId, accessKeyId, secretAccessKey } = getR2Config();

  _client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return _client;
}

// ---------------------------------------------------------------------------
// Presigned URLs
// ---------------------------------------------------------------------------

export interface PresignedUrlOptions {
  /** R2 object key */
  key: string;
  /** MIME type of the object (required for uploads) */
  contentType?: string;
  /** URL validity in seconds (default: 3600 = 1 hour) */
  expiresIn?: number;
}

/**
 * Generate a presigned URL for uploading an object directly to R2.
 *
 * The frontend should PUT the file to this URL with the correct Content-Type header.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600,
): Promise<string> {
  const client = getR2Client();
  const { bucketName } = getR2Config();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- AWS SDK v3 type mismatch
  return getSignedUrl(client as any, command as any, { expiresIn });
}

/**
 * Generate a presigned URL for downloading/streaming an object from R2.
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  const client = getR2Client();
  const { bucketName } = getR2Config();

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- AWS SDK v3 type mismatch
  return getSignedUrl(client as any, command as any, { expiresIn });
}

// ---------------------------------------------------------------------------
// Object operations
// ---------------------------------------------------------------------------

/** Delete an object from R2. */
export async function deleteObject(key: string): Promise<void> {
  const client = getR2Client();
  const { bucketName } = getR2Config();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}

/** Check if an object exists and return its metadata. Returns null if not found. */
export async function headObject(
  key: string,
): Promise<{ contentType: string; contentLength: number } | null> {
  const client = getR2Client();
  const { bucketName } = getR2Config();

  try {
    const result = await client.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );

    return {
      contentType: result.ContentType ?? "application/octet-stream",
      contentLength: result.ContentLength ?? 0,
    };
  } catch (err: unknown) {
    // NoSuchKey or NotFound
    if (
      err instanceof Error &&
      (err.name === "NotFound" || err.name === "NoSuchKey")
    ) {
      return null;
    }
    throw err;
  }
}
