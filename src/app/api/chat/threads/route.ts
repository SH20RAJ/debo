import { NextRequest, NextResponse } from "next/server";
import { resolveUserId } from "@/actions/auth-sync";
import {
  deleteChatThread,
  ensureChatThread,
  getChatThread,
  listChatThreads,
  renameChatThread,
} from "@/lib/chat/server";

// GET /api/chat/threads — List all threads for the current user
export async function GET(req: NextRequest) {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestedId = req.nextUrl.searchParams.get("id");
    if (requestedId) {
      const thread = await getChatThread(userId, requestedId);
      if (!thread) {
        return NextResponse.json({ error: "Thread not found" }, { status: 404 });
      }

      return NextResponse.json({
        id: thread.id,
        title: thread.title || "New Chat",
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
      });
    }

    const threads = await listChatThreads(userId);

    return NextResponse.json({
      threads: threads.map((t) => ({
        id: t.id,
        title: t.title || "New Chat",
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/chat/threads error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST /api/chat/threads — Create a new thread
export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as { id?: string; title?: string };
    const thread = await ensureChatThread(userId, body.id, body.title);

    return NextResponse.json({
      id: thread.id,
      title: thread.title || "New Chat",
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    });
  } catch (error) {
    console.error("POST /api/chat/threads error:", error);
    if (
      error instanceof Error &&
      (error.message.includes("another user") || error.message.includes("already exists"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// DELETE /api/chat/threads?id=xxx — Delete a thread and its messages
export async function DELETE(req: NextRequest) {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const threadId = req.nextUrl.searchParams.get("id");
    if (!threadId) {
      return NextResponse.json({ error: "Missing thread id" }, { status: 400 });
    }

    const deleted = await deleteChatThread(userId, threadId);
    if (!deleted) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/chat/threads error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PATCH /api/chat/threads — Update title
export async function PATCH(req: NextRequest) {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as { id?: string; title?: string };
    const { id, title } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing thread id" }, { status: 400 });
    }

    const thread = await renameChatThread(userId, id, title);
    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      id: thread.id,
      title: thread.title || "New Chat",
      updatedAt: thread.updatedAt,
    });
  } catch (error) {
    console.error("PATCH /api/chat/threads error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
