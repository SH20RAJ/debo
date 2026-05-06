import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chats, messages } from "@/db/schema";
import { resolveUserId } from "@/actions/auth-sync";
import { eq, and, asc } from "drizzle-orm";

const ACTIVE_THREAD_COOKIE = "debo_active_chat_thread";

function readActiveThreadId(req: NextRequest) {
  const value = req.cookies.get(ACTIVE_THREAD_COOKIE)?.value;
  if (!value) return null;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function resolveRequestedThreadId(req: NextRequest, threadId: string | null) {
  if (!threadId || threadId === "new") return null;
  if (threadId === "current") return readActiveThreadId(req);
  return threadId;
}

function getMessageText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!content || typeof content !== "object") return "";

  const value = content as {
    content?: unknown;
    parts?: unknown;
    text?: unknown;
  };

  if (typeof value.text === "string") return value.text;
  if (typeof value.content === "string") return value.content;

  const parts = Array.isArray(value.parts)
    ? value.parts
    : Array.isArray(value.content)
      ? value.content
      : [];

  return parts
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      const text = (part as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    })
    .filter(Boolean)
    .join(" ")
    .trim();
}

// GET /api/chat/history?threadId=xxx — Load messages for a thread
export async function GET(req: NextRequest) {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const threadId = resolveRequestedThreadId(
      req,
      req.nextUrl.searchParams.get("threadId")
    );
    if (!threadId) {
      return NextResponse.json([]);
    }

    // Verify ownership
    const chat = await db.query.chats.findFirst({
      where: and(eq(chats.id, threadId), eq(chats.userId, userId)),
    });
    if (!chat) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const rows = await db.query.messages.findMany({
      where: eq(messages.chatId, threadId),
      orderBy: [asc(messages.createdAt)],
    });

    // Return messages in the format assistant-ui expects
    return NextResponse.json(
      rows.map((row) => {
        try {
          const content = JSON.parse(row.content);
          return {
            id: row.id,
            parent_id: row.metadata ? JSON.parse(row.metadata).parentId || null : null,
            format: row.metadata ? JSON.parse(row.metadata).format || "ai-sdk/v6" : "ai-sdk/v6",
            content,
          };
        } catch {
          return {
            id: row.id,
            parent_id: null,
            format: "ai-sdk/v6",
            content: { role: row.role, content: row.content },
          };
        }
      })
    );
  } catch (error) {
    console.error("GET /api/chat/history error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST /api/chat/history — Persist a message (called by ThreadHistoryAdapter)
export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as {
      id: string;
      parent_id: string | null;
      format: string;
      content: any;
      threadId: string;
    };
    let { id, parent_id, format, content, threadId } = body;

    threadId = resolveRequestedThreadId(req, threadId) || crypto.randomUUID();

    if (!threadId || !id) {
      return NextResponse.json({ error: "Missing threadId or id" }, { status: 400 });
    }

    // Ensure the thread exists, create if not
    const existingChat = await db.query.chats.findFirst({
      where: and(eq(chats.id, threadId), eq(chats.userId, userId)),
    });

    if (!existingChat) {
      await db
        .insert(chats)
        .values({
          id: threadId,
          userId,
          title: null,
        })
        .onConflictDoNothing();
    }

    // Determine role from content
    let role = "user";
    if (content && typeof content === "object") {
      role = content.role || "user";
    }

    const storedContent = JSON.stringify(content);
    const storedMetadata = JSON.stringify({ parentId: parent_id, format });

    await db
      .insert(messages)
      .values({
        id,
        chatId: threadId,
        role,
        content: storedContent,
        metadata: storedMetadata,
      })
      .onConflictDoUpdate({
        target: messages.id,
        set: {
          chatId: threadId,
          role,
          content: storedContent,
          metadata: storedMetadata,
        },
      });

    // Update the chat's updatedAt timestamp
    await db.update(chats).set({ updatedAt: new Date() }).where(eq(chats.id, threadId));

    // Auto-generate title from first user message if title is null
    if (!existingChat?.title && role === "user") {
      const textContent = getMessageText(content);
      if (textContent) {
        const title = textContent.slice(0, 80) + (textContent.length > 80 ? "..." : "");
        await db.update(chats).set({ title }).where(eq(chats.id, threadId));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/chat/history error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
