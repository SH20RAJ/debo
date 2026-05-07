import "server-only";

import { saveJournal } from "@/actions/journals";
import { persistPlainChatExchange } from "@/lib/chat/server";

const MAX_IMPORT_CHARS = 2_000_000;
const MAX_JOURNAL_CHARS = 45_000;
const MAX_MESSAGES = 240;
const MAX_MESSAGE_CHARS = 2_400;

export const AI_CONTEXT_SOURCES = [
  "auto",
  "chatgpt",
  "claude",
  "cursor",
  "codex",
  "gemini",
  "other",
] as const;

export type AiContextSource = (typeof AI_CONTEXT_SOURCES)[number];

export type ImportAiContextInput = {
  userId: string;
  content: string;
  source?: AiContextSource;
  title?: string | null;
  threadId?: string | null;
};

type ImportedMessage = {
  role: string;
  text: string;
  createdAt?: string | null;
};

type ImportedConversation = {
  title: string;
  source: string;
  messages: ImportedMessage[];
};

export async function importAiContext(input: ImportAiContextInput) {
  const rawContent = input.content.trim();
  if (!rawContent) {
    throw new Error("Import content is empty");
  }

  if (rawContent.length > MAX_IMPORT_CHARS) {
    throw new Error("Import is too large. Keep a single import under 2 MB.");
  }

  const requestedSource = input.source || "auto";
  const parsed = parseAiExport(rawContent, requestedSource);
  const title = cleanTitle(input.title || parsed.title || "Imported AI context");
  const formatted = formatContextForDebo(parsed.conversations, rawContent);
  const chunks = chunkText(formatted, MAX_JOURNAL_CHARS).slice(0, 12);
  const journalIds: string[] = [];

  for (const [index, chunk] of chunks.entries()) {
    const suffix = chunks.length > 1 ? ` (${index + 1}/${chunks.length})` : "";
    const result = await saveJournal(
      chunk,
      undefined,
      cleanTitle(`${title}${suffix}`),
      input.userId,
      ["imported-context", parsed.source]
    );

    if (result.success && result.data) {
      journalIds.push(result.data);
    }
  }

  const summary = [
    `Imported ${parsed.messageCount} messages from ${labelSource(parsed.source)}.`,
    `Saved ${journalIds.length} context entr${journalIds.length === 1 ? "y" : "ies"} for retrieval.`,
    "I can now reference this while helping you, and you can ask me to search or summarize it anytime.",
  ].join(" ");

  const { thread } = await persistPlainChatExchange({
    userId: input.userId,
    threadId: input.threadId,
    title,
    source: "context-import",
    userText: `Import context from ${labelSource(parsed.source)}: ${title}`,
    assistantText: summary,
  });

  return {
    success: true,
    title,
    source: parsed.source,
    threadId: thread.id,
    importedMessages: parsed.messageCount,
    importedConversations: parsed.conversations.length,
    journalIds,
    summary,
  };
}

function parseAiExport(raw: string, requestedSource: AiContextSource) {
  const source = requestedSource === "auto" ? detectSource(raw) : requestedSource;
  const parsedJson = parseJson(raw);
  const conversations = parsedJson
    ? parseJsonConversations(parsedJson, source)
    : parsePlainText(raw, source);

  const nonEmpty = conversations
    .map((conversation, index) => ({
      ...conversation,
      title: cleanTitle(conversation.title || `Imported conversation ${index + 1}`),
      messages: conversation.messages
        .filter((message) => message.text.trim())
        .slice(0, MAX_MESSAGES),
    }))
    .filter((conversation) => conversation.messages.length > 0);

  const fallback = nonEmpty.length > 0 ? nonEmpty : parsePlainText(raw, source);
  const messageCount = fallback.reduce(
    (total, conversation) => total + conversation.messages.length,
    0
  );

  return {
    source,
    title: fallback[0]?.title,
    messageCount,
    conversations: fallback,
  };
}

function parseJsonConversations(value: unknown, source: string): ImportedConversation[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => parseJsonConversation(item, source, index));
  }

  if (!value || typeof value !== "object") return [];
  const object = value as Record<string, unknown>;

  const candidates = [
    object.conversations,
    object.chats,
    object.threads,
    object.data,
    object.items,
  ].filter(Array.isArray) as unknown[][];

  if (candidates.length > 0) {
    return candidates.flatMap((items) =>
      items.flatMap((item, index) => parseJsonConversation(item, source, index))
    );
  }

  return parseJsonConversation(object, source, 0);
}

function parseJsonConversation(
  value: unknown,
  source: string,
  index: number
): ImportedConversation[] {
  if (!value || typeof value !== "object") return [];
  const object = value as Record<string, unknown>;

  if (object.mapping && typeof object.mapping === "object") {
    return [parseChatGptConversation(object, source, index)];
  }

  const rawMessages =
    arrayValue(object.messages) ||
    arrayValue(object.chat_messages) ||
    arrayValue(object.chatMessages) ||
    arrayValue(object.turns) ||
    arrayValue(object.entries);

  if (rawMessages) {
    return [
      {
        title: stringValue(object.title) || stringValue(object.name) || `Imported conversation ${index + 1}`,
        source,
        messages: rawMessages.map((message) => parseGenericMessage(message)),
      },
    ];
  }

  return [
    {
      title: stringValue(object.title) || stringValue(object.name) || `Imported context ${index + 1}`,
      source,
      messages: [{ role: "context", text: stringifyCompact(object) }],
    },
  ];
}

function parseChatGptConversation(
  object: Record<string, unknown>,
  source: string,
  index: number
): ImportedConversation {
  const mapping = object.mapping as Record<string, unknown>;
  const messages = Object.values(mapping)
    .map((node) => {
      if (!node || typeof node !== "object") return null;
      const message = (node as { message?: unknown }).message;
      if (!message || typeof message !== "object") return null;
      return parseChatGptMessage(message as Record<string, unknown>);
    })
    .filter((message): message is ImportedMessage => Boolean(message?.text.trim()));

  return {
    title: stringValue(object.title) || `ChatGPT conversation ${index + 1}`,
    source: source === "auto" ? "chatgpt" : source,
    messages,
  };
}

function parseChatGptMessage(message: Record<string, unknown>): ImportedMessage {
  const author = message.author && typeof message.author === "object"
    ? message.author as Record<string, unknown>
    : {};
  const content = message.content && typeof message.content === "object"
    ? message.content as Record<string, unknown>
    : {};
  const parts = arrayValue(content.parts);

  return {
    role: stringValue(author.role) || "message",
    text: parts
      ? parts.map((part) => textFromUnknown(part)).filter(Boolean).join("\n")
      : textFromUnknown(content),
    createdAt: timestampToIso(message.create_time),
  };
}

function parseGenericMessage(message: unknown): ImportedMessage {
  if (typeof message === "string") {
    return { role: "message", text: message };
  }

  if (!message || typeof message !== "object") {
    return { role: "message", text: "" };
  }

  const object = message as Record<string, unknown>;
  const role =
    stringValue(object.role) ||
    stringValue(object.sender) ||
    stringValue(object.author) ||
    stringValue(object.type) ||
    "message";

  return {
    role,
    text:
      stringValue(object.text) ||
      stringValue(object.content) ||
      stringValue(object.message) ||
      textFromUnknown(object.parts) ||
      stringifyCompact(object),
    createdAt:
      stringValue(object.created_at) ||
      stringValue(object.createdAt) ||
      timestampToIso(object.create_time),
  };
}

function parsePlainText(raw: string, source: string): ImportedConversation[] {
  return [
    {
      title: `${labelSource(source)} context import`,
      source,
      messages: [{ role: "context", text: raw }],
    },
  ];
}

function formatContextForDebo(conversations: ImportedConversation[], fallback: string) {
  if (conversations.length === 0) return fallback;

  return conversations
    .map((conversation, index) => {
      const header = [
        `# Imported AI Context ${index + 1}`,
        `Source: ${labelSource(conversation.source)}`,
        `Conversation: ${conversation.title}`,
      ].join("\n");

      const body = conversation.messages
        .slice(0, MAX_MESSAGES)
        .map((message) => {
          const time = message.createdAt ? ` (${message.createdAt})` : "";
          return `\n[${message.role}${time}]\n${truncateText(message.text, MAX_MESSAGE_CHARS)}`;
        })
        .join("\n");

      return `${header}\n${body}`;
    })
    .join("\n\n---\n\n");
}

function detectSource(raw: string): Exclude<AiContextSource, "auto"> {
  const lower = raw.slice(0, 20_000).toLowerCase();
  if (lower.includes('"mapping"') && lower.includes('"chatgpt')) return "chatgpt";
  if (lower.includes('"mapping"') && lower.includes('"author"')) return "chatgpt";
  if (lower.includes("chat_messages") || lower.includes("claude")) return "claude";
  if (lower.includes("cursor") || lower.includes(".cursor")) return "cursor";
  if (lower.includes("gemini")) return "gemini";
  if (lower.includes("codex")) return "codex";
  return "other";
}

function labelSource(source: string) {
  const labels: Record<string, string> = {
    auto: "AI",
    chatgpt: "ChatGPT",
    claude: "Claude",
    cursor: "Cursor",
    codex: "Codex",
    gemini: "Gemini",
    other: "AI",
  };

  return labels[source] || source;
}

function chunkText(text: string, size: number) {
  const chunks: string[] = [];
  for (let index = 0; index < text.length; index += size) {
    chunks.push(text.slice(index, index + size));
  }
  return chunks.length > 0 ? chunks : [text];
}

function cleanTitle(title: string) {
  return title.replace(/\s+/g, " ").trim().slice(0, 190) || "Imported AI context";
}

function truncateText(text: string, maxLength: number) {
  const cleaned = text.replace(/\u0000/g, "").trim();
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength)}...` : cleaned;
}

function parseJson(raw: string) {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value : null;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function textFromUnknown(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map(textFromUnknown).filter(Boolean).join("\n");
  }
  if (!value || typeof value !== "object") return "";

  const object = value as Record<string, unknown>;
  return (
    stringValue(object.text) ||
    stringValue(object.content) ||
    stringValue(object.message) ||
    stringifyCompact(object)
  );
}

function timestampToIso(value: unknown) {
  if (typeof value !== "number") return null;
  const date = new Date(value > 10_000_000_000 ? value : value * 1000);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function stringifyCompact(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
