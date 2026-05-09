import { resolveUserId } from "@/actions/auth-sync";
import { ensureChatThread, normalizeThreadId } from "@/lib/chat/server";
import { normalizeChatMessages, streamDeboChat } from "@/lib/chat/debo-tools";
import { isDatabaseUnavailable, logDatabaseIssue } from "@/lib/db/errors";
import { NextRequest } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const userId = await resolveUserId(undefined, true);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({})) as {
      id?: unknown;
      messages?: unknown;
      message?: unknown;
      prompt?: unknown;
    };
    const rawMessages = Array.isArray(body.messages)
      ? body.messages
      : typeof body.message === "string"
        ? [{ role: "user", content: body.message }]
        : typeof body.prompt === "string"
          ? [{ role: "user", content: body.prompt }]
          : [];
    const messages = normalizeChatMessages(rawMessages);

    if (messages.length === 0) {
      return Response.json({ error: "No message provided" }, { status: 400 });
    }

    let threadId = normalizeThreadId(body.id) ?? crypto.randomUUID();

    try {
      const thread = await ensureChatThread(userId, threadId);
      threadId = thread.id;
    } catch (threadError) {
      if (!isDatabaseUnavailable(threadError)) throw threadError;
      logDatabaseIssue("chat thread create", threadError);
    }

    const result = await streamDeboChat({
      userId,
      messages,
      maxSteps: 4,
    });

    const response = result.toUIMessageStreamResponse();
    response.headers.append(
      "Set-Cookie",
      `debo_active_chat_thread=${encodeURIComponent(threadId)}; Path=/; SameSite=Lax; Max-Age=86400`
    );

    return response;
  } catch (error) {
    console.error("CHAT_API_CRASH:", error);
    const status =
      error instanceof Error &&
      (error.message.includes("another user") || error.message.includes("already exists"))
        ? 409
        : 500;

    return Response.json(
      {
        error: "Intelligence engine error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status }
    );
  }
}
