import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { resolveUserId } from "@/actions/auth-sync";

const MAX_MEDIA_BYTES = 150 * 1024 * 1024;
const ALLOWED_KINDS = new Set(["audio", "video", "image"]);

function getExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  const fromType = file.type.split("/").pop()?.split(";")[0]?.toLowerCase();
  const extension = fromName || fromType || "bin";

  return extension.replace(/[^a-z0-9]/g, "") || "bin";
}

function createMediaKey(userId: string, kind: string, file: File) {
  const datePath = new Date().toISOString().slice(0, 10).replaceAll("-", "/");
  const extension = getExtension(file);

  return `users/${userId}/captures/${kind}/${datePath}/${crypto.randomUUID()}.${extension}`;
}

function getPublicUrl(key: string) {
  const baseUrl = process.env.R2_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;
  if (!baseUrl) return null;

  return `${baseUrl.replace(/\/$/, "")}/${key}`;
}

async function getMediaBucket() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.MEDIA;
  } catch (error) {
    console.warn("[Media] Cloudflare context is not available for R2 uploads.", error);
    return undefined;
  }
}

export async function POST(request: Request) {
  const userId = await resolveUserId(undefined, true);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const kind = String(formData.get("kind") || "media");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload a media file." }, { status: 400 });
  }

  if (!ALLOWED_KINDS.has(kind)) {
    return NextResponse.json({ error: "Media type must be audio, video, or image." }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "The media file is empty." }, { status: 400 });
  }

  if (file.size > MAX_MEDIA_BYTES) {
    return NextResponse.json({ error: "Media file is too large. Keep it under 150 MB." }, { status: 413 });
  }

  const bucket = await getMediaBucket();
  if (!bucket) {
    return NextResponse.json(
      { error: "Media storage is not set. Add the MEDIA R2 bucket binding in Cloudflare." },
      { status: 503 }
    );
  }

  const key = createMediaKey(userId, kind, file);
  const contentType = file.type || "application/octet-stream";

  const object = await bucket.put(key, file, {
    httpMetadata: {
      contentType,
    },
    customMetadata: {
      userId,
      kind,
      originalName: file.name,
    },
  }).catch((error) => {
    console.error("[Media] R2 upload failed:", error);
    return null;
  });

  if (!object) {
    return NextResponse.json({ error: "Could not save media to R2." }, { status: 502 });
  }

  return NextResponse.json({
    media: {
      key,
      uri: `r2://${key}`,
      url: getPublicUrl(key),
      fileName: file.name,
      contentType,
      kind,
      size: object.size || file.size,
      etag: object.etag || null,
    },
  });
}
