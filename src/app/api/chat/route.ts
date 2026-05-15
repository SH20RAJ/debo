import { mastra } from "@/mastra";
import { stackServerApp } from "@/stack/server";
import { MASTRA_RESOURCE_ID_KEY, MASTRA_THREAD_ID_KEY, RequestContext } from "@mastra/core/request-context";
import { handleChatStream } from "@mastra/ai-sdk";
import { createUIMessageStreamResponse } from "ai";

export const maxDuration = 30;

const contextTimeoutMs = Number(process.env.CHAT_CONTEXT_TIMEOUT_MS || 2500);

async function withContextTimeout<T>(
  label: string,
  task: () => Promise<T>,
  fallback: T,
  timeoutMs = contextTimeoutMs
) {
  let settled = false;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const work = Promise.resolve()
    .then(task)
    .then((value) => {
      settled = true;
      return value;
    })
    .catch((error) => {
      if (settled) {
        return fallback;
      }

      settled = true;
      if (process.env.CHAT_CONTEXT_DEBUG === "1") {
        console.warn(`[Chat] ${label} context unavailable:`, error);
      }
      return fallback;
    });

  const timer = new Promise<T>((resolve) => {
    timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        if (process.env.CHAT_CONTEXT_DEBUG === "1") {
          console.warn(`[Chat] ${label} context timed out after ${timeoutMs}ms.`);
        }
        resolve(fallback);
      }
    }, timeoutMs);
  });

  try {
    return await Promise.race([work, timer]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function extractLatestUserText(messages: any[]) {
  const latestUserMessage = [...messages].reverse().find((message) => message?.role === "user");
  if (!latestUserMessage) return "";

  if (typeof latestUserMessage.content === "string") return latestUserMessage.content;
  if (typeof latestUserMessage.text === "string") return latestUserMessage.text;

  const parts = Array.isArray(latestUserMessage.parts) ? latestUserMessage.parts : [];
  return parts
    .map((part: any) => {
      if (typeof part === "string") return part;
      if (part?.type === "text" && typeof part.text === "string") return part.text;
      if (typeof part?.content === "string") return part.content;
      return "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldLoadMemoryContext(text: string) {
  const normalized = text.trim();
  if (normalized.length < 3) return false;
  return !/^(hi|hey|hello|yo|sup|thanks|thank you|ok|okay|k|test)[!.?\s]*$/i.test(normalized);
}

function formatDate(value?: string | Date) {
  if (!value) return "unknown date";
  return new Date(value).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toneInstruction(tone: string) {
  switch (tone) {
    case "calm":
      return "calm, grounded, and reflective";
    case "direct":
      return "direct, plain, and low on filler";
    case "coach":
      return "supportive, practical, and gently action-oriented";
    case "concise":
      return "brief, simple, and focused";
    default:
      return "warm, steady, and human";
  }
}

async function buildRuntimeContext(userId: string, messages: any[]) {
  const latestText = extractLatestUserText(messages);
  const sections: string[] = [];

  try {
    const { getDeboSettings } = await import("@/actions/settings");
    const settings = await withContextTimeout("Settings", () => getDeboSettings(userId), null);
    if (settings) {
      sections.push(
        [
          "User AI settings:",
          `- Assistant name: ${settings.assistantName}`,
          settings.userDisplayName ? `- User display name: ${settings.userDisplayName}` : null,
          `- Response tone: ${toneInstruction(settings.tone)}`,
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
  } catch (error) {
    console.warn("[Chat] Settings context unavailable:", error);
  }

  if (!shouldLoadMemoryContext(latestText)) return sections.join("\n\n") || null;

  try {
    const { getRelevantMemories } = await import("@/lib/memory/query");
    const result = await withContextTimeout(
      "Memory",
      () => getRelevantMemories(userId, latestText, 8, 0),
      null
    );

    if (result?.items?.length) {
      sections.push(
        [
          "Relevant memories from /dashboard/memories:",
          ...result.items.map((memory) => `- ${memory.content}`),
        ].join("\n"),
      );
    }
  } catch (error) {
    console.warn("[Chat] Memory context unavailable:", error);
  }

  try {
    const { searchJournals } = await import("@/lib/vector/search");
    const journals = await withContextTimeout(
      "Journal citation",
      () => searchJournals(latestText, userId, 4),
      []
    );

    if (journals.length > 0) {
      sections.push(
        [
          "Relevant journal citations:",
          ...journals.map((journal, index) => {
            const label = `[J${index + 1}]`;
            const title = journal.title || "Untitled journal";
            return `${label} ${title} (${formatDate(journal.date)}) - ${journal.snippet}`;
          }),
          "If you use a fact from a journal above, cite it inline with its label, for example [J1]. Do not cite memories.",
        ].join("\n"),
      );
    }
  } catch (error) {
    console.warn("[Chat] Journal citation context unavailable:", error);
  }

  sections.push("Use retrieved context quietly. Do not mention tools unless the user asks.");
  return sections.join("\n\n") || null;
}

function shouldRememberChatText(text: string) {
  const normalized = text.trim();
  if (!shouldLoadMemoryContext(normalized) || normalized.length < 24) return false;
  if (/^(can you|could you|please|search|find|summarize|explain|write|create|make|delete|update|fix)\b/i.test(normalized)) {
    return /^remember\b/i.test(normalized);
  }
  if (normalized.endsWith("?") && !/^remember\b/i.test(normalized)) return false;

  return /\b(remember this|remember that|my name is|i am|i'm|i work|i live|i prefer|i like|i love|i hate|i want|i need|i decided|i started|i finished|i feel|i felt|i have|my goal|my project|my preference|my partner|my friend|my family|my job|my company)\b/i.test(normalized);
}

async function rememberImportantChat(userId: string, messages: any[]) {
  const latestText = extractLatestUserText(messages);
  if (!shouldRememberChatText(latestText)) return;

  try {
    const { addMemory } = await import("@/actions/memories");
    await withContextTimeout(
      "Save memory",
      () => addMemory(latestText.replace(/^remember (this|that)[:\s-]*/i, ""), userId),
      null,
      2000
    );
  } catch (error) {
    console.warn("[Chat] Could not save important memory:", error);
  }
}

async function captureCharacterContext(userId: string, threadId: string, messages: any[]) {
  const latestText = extractLatestUserText(messages);
  if (!shouldLoadMemoryContext(latestText) || latestText.length < 12) return;

  try {
    const { captureCharacterMentionsFromText } = await import("@/features/characters/actions");
    await withContextTimeout(
      "Character capture",
      () => captureCharacterMentionsFromText({
        userId,
        text: latestText,
        title: "Debo chat",
        sourceType: "chat",
        sourceId: threadId,
      }),
      null,
      1800
    );
  } catch (error) {
    if (process.env.CHAT_CONTEXT_DEBUG === "1") {
      console.warn("[Chat] Could not capture character context:", error);
    }
  }
}

export async function POST(req: Request) {
  const { messages, threadId: requestedThreadId } = (await req.json()) as {
    messages: any[];
    threadId?: string;
  };

  const user = await stackServerApp.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = user.id;
  const threadId = requestedThreadId || crypto.randomUUID();

  // Initialize request context for Mastra tools
  const requestContext = new RequestContext();
  requestContext.set("userId", userId);
  requestContext.set(MASTRA_RESOURCE_ID_KEY, userId);
  requestContext.set(MASTRA_THREAD_ID_KEY, threadId);

  await rememberImportantChat(userId, messages);
  void captureCharacterContext(userId, threadId, messages);

  const runtimeContext = await buildRuntimeContext(userId, messages);
  if (runtimeContext) {
    requestContext.set("memoryContext", runtimeContext);
  }

  // Dynamically inject Composio tools (with graceful error handling)
  let dynamicTools: Record<string, any> = {};
  try {
    const { getComposioActiveApps } = await import("@/actions/composio");
    const activeApps = await getComposioActiveApps();
    const toolkits = activeApps
      .map((app) => app.slug)
      .filter((slug) => !["googledrive", "youtube"].includes(slug));

    if (toolkits.length > 0) {
      const { getComposioTools } = await import("@/mastra/tools/composio-tools");
      dynamicTools = await getComposioTools(userId, toolkits);
      const toolCount = Object.keys(dynamicTools).length;
      if (toolCount > 0) {
        console.log(`[Chat] Loaded ${toolCount} Composio tools for: ${toolkits.join(", ")}`);
      } else {
        console.warn(`[Chat] No tools loaded for: ${toolkits.join(", ")}`);
      }
    }
  } catch (error) {
    // Composio tool loading failed — continue without external tools
    console.warn("[Chat] Composio tools unavailable, continuing without them:", error);
  }

  const stream = await handleChatStream({
    mastra,
    agentId: "debo",
    version: "v6",
    params: {
      messages: runtimeContext
        ? [
            {
              role: "system",
              content: runtimeContext,
            },
            ...messages,
          ]
        : messages,
      memory: {
        thread: { id: threadId },
        resource: userId,
      },
      toolsets: Object.keys(dynamicTools).length > 0 ? { composio: dynamicTools } : undefined,
      requestContext,
    } as any,
  });

  return createUIMessageStreamResponse({ stream });
}
