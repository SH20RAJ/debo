import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chats, messages } from "@/db/schema";
import { resolveUserId } from "@/actions/auth-sync";
import { eq, and, desc } from "drizzle-orm";

// GET /api/chat/threads — List all threads for the current user
export async function GET() {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const threads = await db.query.chats.findMany({
      where: eq(chats.userId, userId),
      orderBy: [desc(chats.updatedAt)],
    });

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
    const threadId = body.id || crypto.randomUUID();
    const title = body.title?.trim() || null;

    await db
      .insert(chats)
      .values({
        id: threadId,
        userId,
        title,
      })
      .onConflictDoNothing({ target: chats.id });

    const thread = await db.query.chats.findFirst({
      where: and(eq(chats.id, threadId), eq(chats.userId, userId)),
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread id already exists" }, { status: 409 });
    }

    return NextResponse.json({
      id: thread.id,
      title: thread.title || "New Chat",
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    });
  } catch (error) {
    console.error("POST /api/chat/threads error:", error);
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

    // Verify ownership
    const chat = await db.query.chats.findFirst({
      where: and(eq(chats.id, threadId), eq(chats.userId, userId)),
    });
    if (!chat) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Delete messages first (foreign key), then the chat
    await db.delete(messages).where(eq(messages.chatId, threadId));
    await db.delete(chats).where(eq(chats.id, threadId));

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

    const chat = await db.query.chats.findFirst({
      where: and(eq(chats.id, id), eq(chats.userId, userId)),
    });
    if (!chat) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    await db.update(chats).set({ title: title?.trim() || null, updatedAt: new Date() }).where(eq(chats.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/chat/threads error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
