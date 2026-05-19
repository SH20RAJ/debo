import { Hono } from "hono";
import { stream } from "hono/streaming";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@debo/db";
import { chatThreads, chatMessages } from "@debo/db/schema";
import { getRelevantContext } from "@debo/memory";
import { getAppContext } from "../lib/context";
import { AppError } from "../lib/errors";

const NVIDIA_BASE_URL = process.env.OPENAI_BASE_URL || "https://integrate.api.nvidia.com/v1";
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY || "";
const MODEL = process.env.OPENAI_MODEL || "meta/llama-3.3-70b-instruct";

const SYSTEM_PROMPT = `You are Debo, a private memory assistant. You have access to the user's personal memory graph — journal entries, voice transcripts, notes, tasks, people, and projects.

Guidelines:
- Answer based on the user's actual memory context provided below.
- If the context contains relevant information, use it and cite sources naturally.
- If no relevant memory exists, say so honestly rather than making things up.
- Be concise, warm, and helpful. Speak like a knowledgeable friend who knows the user well.
- When referencing sources, mention the source type and title naturally in your response.`;

const app = new Hono();

// ─── Existing CRUD ──────────────────────────────────────────────────────────

app.get("/threads", async (c) => {
  const ctx = getAppContext(c);
  const rows = await db.select().from(chatThreads).where(eq(chatThreads.userId, ctx.userId)).orderBy(desc(chatThreads.updatedAt));
  return c.json(rows);
});

app.post("/threads", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const [created] = await db.insert(chatThreads).values({
    id: crypto.randomUUID(), userId: ctx.userId, workspaceId: ctx.workspaceId, title: body.title,
  }).returning();
  return c.json(created, 201);
});

app.get("/threads/:id/messages", async (c) => {
  const ctx = getAppContext(c);
  const threadId = c.req.param("id");
  const [thread] = await db.select().from(chatThreads).where(and(eq(chatThreads.id, threadId), eq(chatThreads.userId, ctx.userId)));
  if (!thread) return c.json({ error: "Not found" }, 404);
  const rows = await db.select().from(chatMessages).where(eq(chatMessages.threadId, threadId)).orderBy(chatMessages.createdAt);
  return c.json(rows);
});

app.post("/threads/:id/messages", async (c) => {
  const ctx = getAppContext(c);
  const threadId = c.req.param("id");
  const body = await c.req.json();
  const [thread] = await db.select().from(chatThreads).where(and(eq(chatThreads.id, threadId), eq(chatThreads.userId, ctx.userId)));
  if (!thread) return c.json({ error: "Not found" }, 404);
  const [created] = await db.insert(chatMessages).values({
    id: crypto.randomUUID(), userId: ctx.userId, workspaceId: ctx.workspaceId,
    threadId, role: body.role, content: body.content,
  }).returning();
  return c.json(created, 201);
});

// ─── Helper: build messages array for NIM ───────────────────────────────────

async function buildNimMessages(userId: string, threadId: string, userMessage: string) {
  // Retrieve memory context
  const context = await getRelevantContext(userId, userMessage, 8);

  // Fetch thread history (last 20 messages for token budget)
  const history = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.threadId, threadId))
    .orderBy(chatMessages.createdAt)
    .limit(20);

  const systemContent = context.contextText
    ? `${SYSTEM_PROMPT}\n\n---\n\n# User Memory Context\n\n${context.contextText}`
    : SYSTEM_PROMPT;

  const messages: { role: string; content: string }[] = [
    { role: "system", content: systemContent },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  return { messages, context };
}

// ─── POST /threads/:id/reply — non-streaming AI reply ───────────────────────

app.post("/threads/:id/reply", async (c) => {
  const ctx = getAppContext(c);
  const threadId = c.req.param("id");
  const body = await c.req.json();
  const userContent = body.content;
  if (!userContent) throw new AppError("content is required", 400, "BAD_REQUEST");

  // Verify thread ownership
  const [thread] = await db.select().from(chatThreads).where(and(eq(chatThreads.id, threadId), eq(chatThreads.userId, ctx.userId)));
  if (!thread) return c.json({ error: "Not found" }, 404);

  // Save user message
  const [userMsg] = await db.insert(chatMessages).values({
    id: crypto.randomUUID(), userId: ctx.userId, workspaceId: ctx.workspaceId,
    threadId, role: "user", content: userContent,
  }).returning();

  // Build context + call NIM
  const { messages } = await buildNimMessages(ctx.userId, threadId, userContent);

  const nimRes = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: 1024, temperature: 0.7 }),
  });

  if (!nimRes.ok) {
    const err = await nimRes.text();
    console.error("NIM error:", nimRes.status, err);
    throw new AppError("AI generation failed", 502, "AI_ERROR");
  }

  const data = (await nimRes.json()) as any;
  const assistantContent = data.choices?.[0]?.message?.content || "I could not generate a response.";

  // Save assistant message
  const [assistantMsg] = await db.insert(chatMessages).values({
    id: crypto.randomUUID(), userId: ctx.userId, workspaceId: ctx.workspaceId,
    threadId, role: "assistant", content: assistantContent,
    metadataJson: JSON.stringify({ model: MODEL, tokens: data.usage }),
  }).returning();

  // Update thread timestamp
  await db.update(chatThreads).set({ updatedAt: new Date().toISOString() }).where(eq(chatThreads.id, threadId));

  return c.json({ userMessage: userMsg, assistantMessage: assistantMsg });
});

// ─── POST /threads/:id/stream — SSE streaming AI reply ─────────────────────

app.post("/threads/:id/stream", async (c) => {
  const ctx = getAppContext(c);
  const threadId = c.req.param("id");
  const body = await c.req.json();
  const userContent = body.content;
  if (!userContent) throw new AppError("content is required", 400, "BAD_REQUEST");

  // Verify thread ownership
  const [thread] = await db.select().from(chatThreads).where(and(eq(chatThreads.id, threadId), eq(chatThreads.userId, ctx.userId)));
  if (!thread) return c.json({ error: "Not found" }, 404);

  // Save user message
  await db.insert(chatMessages).values({
    id: crypto.randomUUID(), userId: ctx.userId, workspaceId: ctx.workspaceId,
    threadId, role: "user", content: userContent,
  });

  // Build context
  const { messages } = await buildNimMessages(ctx.userId, threadId, userContent);

  // Call NIM with streaming
  const nimRes = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: 1024, temperature: 0.7, stream: true }),
  });

  if (!nimRes.ok) {
    const err = await nimRes.text();
    console.error("NIM stream error:", nimRes.status, err);
    throw new AppError("AI generation failed", 502, "AI_ERROR");
  }

  // Stream SSE back to client
  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");

  let fullContent = "";

  return stream(c, async (s) => {
    const reader = nimRes.body?.getReader();
    if (!reader) {
      await s.write("data: [ERROR] No stream body\n\n");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const payload = trimmed.slice(6);
          if (payload === "[DONE]") {
            await s.write("data: [DONE]\n\n");
            continue;
          }

          try {
            const chunk = JSON.parse(payload);
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              await s.write(`data: ${JSON.stringify({ token: delta })}\n\n`);
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Save the complete assistant message
    if (fullContent) {
      await db.insert(chatMessages).values({
        id: crypto.randomUUID(), userId: ctx.userId, workspaceId: ctx.workspaceId,
        threadId, role: "assistant", content: fullContent,
        metadataJson: JSON.stringify({ model: MODEL, streamed: true }),
      });

      await db.update(chatThreads).set({ updatedAt: new Date().toISOString() }).where(eq(chatThreads.id, threadId));
    }
  });
});

export default app;
