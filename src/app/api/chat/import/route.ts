import { resolveUserId } from "@/actions/auth-sync";
import { AI_CONTEXT_SOURCES, importAiContext } from "@/lib/chat/context-import";
import { ACTIVE_THREAD_COOKIE, resolveRequestedThreadId } from "@/lib/chat/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const importSchema = z.object({
  source: z.enum(AI_CONTEXT_SOURCES).optional().default("auto"),
  title: z.string().max(200).optional(),
  content: z.string().min(1).max(2_000_000),
  threadId: z.string().optional().nullable(),
});

function readActiveThreadId(req: NextRequest) {
  const value = req.cookies.get(ACTIVE_THREAD_COOKIE)?.value;
  if (!value) return null;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId(undefined, true);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = importSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid import payload" },
        { status: 400 }
      );
    }

    const result = await importAiContext({
      userId,
      source: parsed.data.source,
      title: parsed.data.title,
      content: parsed.data.content,
      threadId: resolveRequestedThreadId(parsed.data.threadId, readActiveThreadId(req)),
    });

    const response = NextResponse.json(result);
    response.headers.append(
      "Set-Cookie",
      `${ACTIVE_THREAD_COOKIE}=${encodeURIComponent(result.threadId)}; Path=/; SameSite=Lax; Max-Age=86400`
    );

    return response;
  } catch (error) {
    console.error("POST /api/chat/import error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Import failed",
      },
      { status: 500 }
    );
  }
}
