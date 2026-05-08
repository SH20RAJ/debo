import { NextRequest, NextResponse } from "next/server";
import { resolveUserId } from "@/actions/auth-sync";
import {
  ACTIVE_THREAD_COOKIE,
  listChatMessages,
  persistChatStorageMessage,
  resolveRequestedThreadId,
  serializeChatMessage,
} from "@/lib/chat/server";
import { isDatabaseUnavailable, logDatabaseIssue } from "@/lib/db/errors";

function readActiveThreadId(req: NextRequest) {
  const value = req.cookies.get(ACTIVE_THREAD_COOKIE)?.value;
  if (!value) return null;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// GET /api/chat/history?threadId=xxx — Load messages for a thread
export async function GET(req: NextRequest) {
  try {
    const userId = await resolveUserId(undefined, true);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const threadId = resolveRequestedThreadId(
      req.nextUrl.searchParams.get("threadId"),
      readActiveThreadId(req)
    );
    if (!threadId) {
      return NextResponse.json([]);
    }

    const rows = await listChatMessages(userId, threadId);
    if (!rows) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    return NextResponse.json(rows.map(serializeChatMessage));
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      logDatabaseIssue("chat history read", error);
      return NextResponse.json([]);
    }

    console.error("GET /api/chat/history error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST /api/chat/history — Persist a message (called by ThreadHistoryAdapter)
export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId(undefined, true);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as {
      id: string;
      parent_id: string | null;
      format: string;
      content: unknown;
      threadId: string;
    };
    const { id, parent_id, format, content } = body;

    const threadId =
      resolveRequestedThreadId(body.threadId, readActiveThreadId(req)) ||
      crypto.randomUUID();

    if (!threadId || !id) {
      return NextResponse.json({ error: "Missing threadId or id" }, { status: 400 });
    }

    await persistChatStorageMessage({
      userId,
      threadId,
      id,
      parentId: parent_id,
      format,
      content,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      logDatabaseIssue("chat history write", error);
      return NextResponse.json({ success: false, offline: true });
    }

    console.error("POST /api/chat/history error:", error);
    if (
      error instanceof Error &&
      (error.message.includes("another user") || error.message.includes("already exists"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
