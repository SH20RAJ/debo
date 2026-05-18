import { getCloudflareContext } from "@/lib/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { resolveUserId } from "@/actions/auth-sync";

type RouteContext = {
  params: Promise<{
    key: string[];
  }>;
};

async function getMediaBucket() {
  try {
    const { env } = getCloudflareContext();
    return env.MEDIA;
  } catch (error) {
    console.warn("[Media] Cloudflare context is not available for R2 reads.", error);
    return undefined;
  }
}

function normalizeMediaKey(parts: string[]) {
  const key = parts.join("/");
  if (!key || key.startsWith("/") || key.includes("..") || /[\u0000-\u001f\u007f]/.test(key)) {
    return null;
  }

  return key;
}

function parseRangeHeader(rangeHeader: string | null, size: number) {
  if (!rangeHeader) return null;

  const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) return "invalid" as const;

  const [, startValue, endValue] = match;
  if (!startValue && !endValue) return "invalid" as const;

  if (!startValue) {
    const suffix = Number(endValue);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return "invalid" as const;
    const length = Math.min(suffix, size);
    return {
      offset: Math.max(0, size - length),
      length,
    };
  }

  const start = Number(startValue);
  const end = endValue ? Number(endValue) : size - 1;
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    end < start ||
    start >= size
  ) {
    return "invalid" as const;
  }

  return {
    offset: start,
    length: Math.min(end, size - 1) - start + 1,
  };
}

async function readMedia(request: NextRequest, context: RouteContext, headOnly = false) {
  const userId = await resolveUserId(undefined, true);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key: keyParts } = await context.params;
  const key = normalizeMediaKey(keyParts);
  if (!key || !key.startsWith(`users/${userId}/captures/`)) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  const bucket = await getMediaBucket();
  if (!bucket) {
    return NextResponse.json({ error: "Media storage is not available." }, { status: 503 });
  }

  const head = await bucket.head(key);
  if (!head) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  const requestedRange = parseRangeHeader(request.headers.get("range"), head.size);
  if (requestedRange === "invalid") {
    return new Response(null, {
      status: 416,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Range": `bytes */${head.size}`,
      },
    });
  }

  const object = headOnly
    ? null
    : await bucket.get(key, requestedRange ? { range: requestedRange } : undefined);

  if (!headOnly && !object) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  const headers = new Headers();
  head.writeHttpMetadata(headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "private, max-age=3600");
  headers.set("ETag", head.httpEtag);

  if (requestedRange) {
    const end = requestedRange.offset + requestedRange.length - 1;
    headers.set("Content-Range", `bytes ${requestedRange.offset}-${end}/${head.size}`);
    headers.set("Content-Length", String(requestedRange.length));
  } else {
    headers.set("Content-Length", String(head.size));
  }

  return new Response(headOnly ? null : object?.body, {
    status: requestedRange ? 206 : 200,
    headers,
  });
}

export function GET(request: NextRequest, context: RouteContext) {
  return readMedia(request, context);
}

export function HEAD(request: NextRequest, context: RouteContext) {
  return readMedia(request, context, true);
}
