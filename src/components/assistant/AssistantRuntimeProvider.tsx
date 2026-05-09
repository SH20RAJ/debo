"use client";

import {
  AssistantRuntimeProvider,
  useRemoteThreadListRuntime,
  type MessageFormatAdapter,
  type MessageFormatItem,
  type MessageStorageEntry,
  type RemoteThreadListAdapter,
  type ThreadHistoryAdapter,
} from "@assistant-ui/react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { useAui, useAuiState } from "@assistant-ui/store";
import { AssistantChatTransport, useAISDKRuntime } from "@assistant-ui/react-ai-sdk";
import { createAssistantStream } from "assistant-stream";
import type { ChatTransport } from "ai";
import { ReactNode, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { usePathname, useRouter } from "next/navigation";

type MyAssistantRuntimeProviderProps = {
  children: ReactNode;
  initialThreadId?: string | null;
};

type ChatHistoryRow = {
  id: string;
  parent_id: string | null;
  format: string;
  content: Record<string, unknown>;
};

const CHAT_READ_TIMEOUT_MS = 5000;
const CHAT_WRITE_TIMEOUT_MS = 5000;

export function MyAssistantRuntimeProvider({
  children,
  initialThreadId,
}: MyAssistantRuntimeProviderProps) {
  const initialUsableThreadId = readUsableThreadId(initialThreadId);
  const activeThreadIdRef = useRef<string | null>(initialUsableThreadId);

  useEffect(() => {
    if (!initialUsableThreadId) return;
    activeThreadIdRef.current = initialUsableThreadId;
    setBrowserActiveThreadId(initialUsableThreadId);
  }, [initialUsableThreadId]);

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/chat",
      }),
    []
  );

  const threadListAdapter = useMemo(() => createThreadListAdapter(), []);
  const runtimeInitialThreadId = useMemo(
    () => initialUsableThreadId ?? readBrowserActiveThreadId() ?? undefined,
    [initialUsableThreadId]
  );

  const runtime = useRemoteThreadListRuntime({
    runtimeHook: function RuntimeHook() {
      return useDeboChatThreadRuntime(transport, activeThreadIdRef);
    },
    adapter: threadListAdapter,
    initialThreadId: runtimeInitialThreadId,
    allowNesting: true,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}

export function ChatThreadUrlSync() {
  const router = useRouter();
  const pathname = usePathname();
  const localId = useAuiState((state) => state.threadListItem.id);
  const remoteId = useAuiState((state) => state.threadListItem.remoteId);
  const threadId = readUsableThreadId(remoteId) ?? readUsableThreadId(localId);
  const lastSyncedHref = useRef<string | null>(null);

  useEffect(() => {
    if (!threadId || !pathname?.startsWith("/chat")) return;

    const href = `/chat/${encodeURIComponent(threadId)}`;
    if (pathname === href || lastSyncedHref.current === href) return;

    lastSyncedHref.current = href;
    router.replace(href, { scroll: false });
  }, [pathname, router, threadId]);

  return null;
}

function createHistoryAdapter(aui: ReturnType<typeof useAui>): ThreadHistoryAdapter {
  return {
    async load() {
      return { headId: null, messages: [] };
    },
    async append() {},
    withFormat: <TMessage, TStorageFormat extends Record<string, unknown>>(
      fmt: MessageFormatAdapter<TMessage, TStorageFormat>
    ) => ({
      async load() {
        try {
          const threadId = aui.threadListItem().getState().remoteId;
          if (!threadId) return { messages: [] };
          const localRows = readLocalHistory(threadId);

          const res = await fetchWithTimeout(`/api/chat/history?threadId=${encodeURIComponent(threadId)}`, {
            cache: "no-store",
          }, CHAT_READ_TIMEOUT_MS);
          if (!res.ok) {
            return {
              headId: localRows.at(-1)?.id ?? null,
              messages: localRows.map((row) => fmt.decode(row as MessageStorageEntry<TStorageFormat>)),
            };
          }
          const rows = (await res.json()) as ChatHistoryRow[];
          if (rows.length > 0) writeLocalHistory(threadId, rows);
          return {
            headId: rows.at(-1)?.id ?? null,
            messages: rows.map((row) =>
              fmt.decode(row as MessageStorageEntry<TStorageFormat>)
            ),
          };
        } catch (e) {
          if (!isAbortError(e)) {
            console.error("Failed to load history:", e);
          }
          const threadId = aui.threadListItem().getState().remoteId;
          const localRows = threadId ? readLocalHistory(threadId) : [];
          return {
            headId: localRows.at(-1)?.id ?? null,
            messages: localRows.map((row) =>
              fmt.decode(row as MessageStorageEntry<TStorageFormat>)
            ),
          };
        }
      },
      async append(item: MessageFormatItem<TMessage>) {
        const { remoteId } = await aui.threadListItem().initialize();
        setBrowserActiveThreadId(remoteId);
        persistLocalHistoryItem(fmt, item, remoteId);
        void persistHistoryItem(fmt, item, remoteId);
      },
      async update(item: MessageFormatItem<TMessage>) {
        const remoteId = aui.threadListItem().getState().remoteId;
        if (!remoteId) return;
        persistLocalHistoryItem(fmt, item, remoteId);
        void persistHistoryItem(fmt, item, remoteId);
      },
    }),
  };
}

function useDynamicChatTransport<UI_MESSAGE extends UIMessage = UIMessage>(
  transport: ChatTransport<UI_MESSAGE>
): ChatTransport<UI_MESSAGE> {
  const transportRef = useRef<ChatTransport<UI_MESSAGE>>(transport);

  useEffect(() => {
    transportRef.current = transport;
  });

  return useMemo(
    () =>
      new Proxy(transportRef.current, {
        get(_, prop) {
          const value = transportRef.current[prop as keyof ChatTransport<UI_MESSAGE>];
          return typeof value === "function" ? value.bind(transportRef.current) : value;
        },
      }),
    []
  );
}

function useDeboChatThreadRuntime(
  transport: AssistantChatTransport<UIMessage>,
  activeThreadIdRef: MutableRefObject<string | null>
) {
  const dynamicTransport = useDynamicChatTransport(transport as ChatTransport<UIMessage>);
  const id = useAuiState((state) => state.threadListItem.id);
  const remoteId = useAuiState((state) => state.threadListItem.remoteId);
  const aui = useAui();
  const historyAdapter = useMemo(() => createHistoryAdapter(aui), [aui]);

  useEffect(() => {
    const nextThreadId = readUsableThreadId(remoteId) ?? readUsableThreadId(id);
    if (!nextThreadId) return;
    activeThreadIdRef.current = nextThreadId;
    setBrowserActiveThreadId(nextThreadId);
  }, [activeThreadIdRef, id, remoteId]);

  const chat = useChat({
    id,
    transport: dynamicTransport,
    onError(error) {
      console.error("Debo chat request failed:", error);
    },
  });

  const runtime = useAISDKRuntime(chat, {
    adapters: {
      history: historyAdapter,
    },
  });

  transport.setRuntime(runtime);
  transport.__internal_setGetThreadListItem(() =>
    aui.threadListItem.source ? aui.threadListItem() : undefined
  );

  return runtime;
}

function readBrowserActiveThreadId() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)debo_active_chat_thread=([^;]+)/);
  if (!match?.[1]) return null;

  try {
    return readUsableThreadId(decodeURIComponent(match[1]));
  } catch {
    return readUsableThreadId(match[1]);
  }
}

function setBrowserActiveThreadId(threadId: string) {
  if (typeof document === "undefined") return;
  if (!readUsableThreadId(threadId)) return;
  document.cookie = `debo_active_chat_thread=${encodeURIComponent(
    threadId
  )}; path=/; max-age=86400; samesite=lax`;
}

function clearBrowserActiveThreadId(threadId: string) {
  if (typeof document === "undefined") return;
  if (readBrowserActiveThreadId() !== threadId) return;
  document.cookie = "debo_active_chat_thread=; path=/; max-age=0; samesite=lax";
}

function createThreadListAdapter(): RemoteThreadListAdapter {
  return {
    async list() {
      const localThreads = readLocalThreads();
      try {
        const res = await fetchWithTimeout("/api/chat/threads", { cache: "no-store" }, CHAT_READ_TIMEOUT_MS);
        if (!res.ok) {
          return { threads: localThreads.map(threadToRuntimeItem) };
        }
        const data = (await res.json()) as {
          threads?: Array<{ id: string; title?: string | null }>;
        };
        const remoteThreads = (data.threads ?? [])
          .filter((thread) => readUsableThreadId(thread.id))
          .map((thread) => ({
            id: thread.id,
            title: thread.title || "New Chat",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        const threads = mergeLocalThreads(remoteThreads, localThreads);

        return {
          threads: threads.map(threadToRuntimeItem),
        };
      } catch (error) {
        if (!isAbortError(error)) {
          console.error("Failed to load chat threads:", error);
        }
        return { threads: localThreads.map(threadToRuntimeItem) };
      }
    },
    async initialize(localId) {
      const remoteId = readUsableThreadId(localId) ?? createClientThreadId();
      upsertLocalThread({ id: remoteId, title: "New Chat" });
      setBrowserActiveThreadId(remoteId);

      void fetchWithTimeout("/api/chat/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: remoteId }),
      }, CHAT_WRITE_TIMEOUT_MS).catch((error) => {
        if (!isAbortError(error)) {
          console.warn("Chat thread will stay local until database is reachable:", error);
        }
      });

      return { remoteId, externalId: remoteId };
    },
    async fetch(threadId) {
      const usableThreadId = readUsableThreadId(threadId) ?? createClientThreadId();
      const localThread = findLocalThread(usableThreadId) ?? upsertLocalThread({
        id: usableThreadId,
        title: "New Chat",
      });

      try {
        const res = await fetchWithTimeout(`/api/chat/threads?id=${encodeURIComponent(usableThreadId)}`, {
          cache: "no-store",
        }, CHAT_READ_TIMEOUT_MS);

        if (res.status === 404) {
          void fetchWithTimeout("/api/chat/threads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: usableThreadId }),
          }, CHAT_WRITE_TIMEOUT_MS).catch(() => {});
          setBrowserActiveThreadId(usableThreadId);
          return threadToRuntimeItem(localThread);
        }

        if (!res.ok) throw new Error("Thread not found");

        const thread = (await res.json()) as { id: string; title?: string | null };
        const savedThread = upsertLocalThread({
          id: thread.id,
          title: thread.title || "New Chat",
        });
        setBrowserActiveThreadId(thread.id);
        return threadToRuntimeItem(savedThread);
      } catch {
        setBrowserActiveThreadId(usableThreadId);
        return threadToRuntimeItem(localThread);
      }
    },
    async rename(remoteId, newTitle) {
      upsertLocalThread({ id: remoteId, title: newTitle || "New Chat" });
      const res = await fetchWithTimeout("/api/chat/threads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: remoteId, title: newTitle }),
      }, CHAT_WRITE_TIMEOUT_MS);
      if (!res.ok) throw new Error(`Thread rename failed with ${res.status}`);
    },
    async archive() {},
    async unarchive() {},
    async delete(remoteId) {
      deleteLocalThread(remoteId);
      const res = await fetchWithTimeout(`/api/chat/threads?id=${encodeURIComponent(remoteId)}`, {
        method: "DELETE",
      }, CHAT_WRITE_TIMEOUT_MS);
      if (!res.ok && res.status !== 404) {
        throw new Error(`Thread delete failed with ${res.status}`);
      }
      clearBrowserActiveThreadId(remoteId);
    },
    async generateTitle(remoteId, unstableMessages) {
      const title = createTitleFromMessages(unstableMessages);
      upsertLocalThread({ id: remoteId, title });
      void fetchWithTimeout("/api/chat/threads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: remoteId, title }),
      }, CHAT_WRITE_TIMEOUT_MS).catch(() => {});

      return createAssistantStream((controller) => {
        controller.appendText(title);
      });
    },
  };
}

type LocalThread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

const LOCAL_THREADS_KEY = "debo_chat_threads_v2";
const LOCAL_HISTORY_PREFIX = "debo_chat_history_v2:";

function isAssistantLocalThreadId(threadId: string) {
  return threadId.startsWith("__LOCALID_");
}

function readUsableThreadId(threadId?: string | null) {
  if (!threadId || isAssistantLocalThreadId(threadId)) return null;
  return threadId;
}

function createClientThreadId() {
  return crypto.randomUUID();
}

function readLocalThreads(): LocalThread[] {
  if (typeof localStorage === "undefined") return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_THREADS_KEY) || "[]") as LocalThread[];
    return Array.isArray(parsed)
      ? parsed.filter((thread) => Boolean(readUsableThreadId(thread.id)))
      : [];
  } catch {
    return [];
  }
}

function writeLocalThreads(threads: LocalThread[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LOCAL_THREADS_KEY, JSON.stringify(threads.slice(0, 60)));
}

function findLocalThread(threadId: string) {
  return readLocalThreads().find((thread) => thread.id === threadId) ?? null;
}

function upsertLocalThread(input: { id: string; title?: string | null }) {
  const now = new Date().toISOString();
  const threads = readLocalThreads();
  const existing = threads.find((thread) => thread.id === input.id);
  const next: LocalThread = {
    id: input.id,
    title: input.title?.trim() || existing?.title || "New Chat",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  writeLocalThreads([next, ...threads.filter((thread) => thread.id !== input.id)]);
  return next;
}

function deleteLocalThread(threadId: string) {
  writeLocalThreads(readLocalThreads().filter((thread) => thread.id !== threadId));
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(`${LOCAL_HISTORY_PREFIX}${threadId}`);
  }
}

function mergeLocalThreads(primary: LocalThread[], fallback: LocalThread[]) {
  const seen = new Set<string>();
  return [...primary, ...fallback].filter((thread) => {
    if (seen.has(thread.id)) return false;
    seen.add(thread.id);
    return true;
  });
}

function threadToRuntimeItem(thread: LocalThread) {
  return {
    remoteId: thread.id,
    externalId: thread.id,
    status: "regular" as const,
    title: thread.title || "New Chat",
  };
}

function readLocalHistory(threadId: string): ChatHistoryRow[] {
  if (typeof localStorage === "undefined") return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(`${LOCAL_HISTORY_PREFIX}${threadId}`) || "[]") as ChatHistoryRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalHistory(threadId: string, rows: ChatHistoryRow[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(`${LOCAL_HISTORY_PREFIX}${threadId}`, JSON.stringify(rows.slice(-200)));
}

function persistLocalHistoryItem<TMessage, TStorageFormat extends Record<string, unknown>>(
  fmt: MessageFormatAdapter<TMessage, TStorageFormat>,
  item: MessageFormatItem<TMessage>,
  threadId: string
) {
  const rows = readLocalHistory(threadId);
  const row: ChatHistoryRow = {
    id: fmt.getId(item.message),
    parent_id: item.parentId,
    format: fmt.format,
    content: fmt.encode(item),
  };
  writeLocalHistory(threadId, [...rows.filter((existing) => existing.id !== row.id), row]);
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 1500) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

function isAbortError(error: unknown) {
  return (
    error instanceof DOMException && error.name === "AbortError" ||
    error instanceof Error && /abort|signal is aborted/i.test(error.message)
  );
}

async function persistHistoryItem<TMessage, TStorageFormat extends Record<string, unknown>>(
  fmt: MessageFormatAdapter<TMessage, TStorageFormat>,
  item: MessageFormatItem<TMessage>,
  threadId: string
) {
  try {
    const res = await fetch("/api/chat/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: fmt.getId(item.message),
        parent_id: item.parentId,
        format: fmt.format,
        content: fmt.encode(item),
        threadId,
      }),
    });

    if (!res.ok) {
      throw new Error(`History API returned ${res.status}`);
    }
  } catch (e) {
    console.error("Failed to persist message:", e);
  }
}

function createTitleFromMessages(messages: unknown) {
  const list = Array.isArray(messages) ? messages : [];
  const firstUserText =
    list.map(readMessageText).find((text) => text.trim().length > 0) || "New Chat";
  const title = firstUserText.replace(/\s+/g, " ").trim();
  return title.length > 80 ? `${title.slice(0, 80)}...` : title;
}

function readMessageText(message: unknown): string {
  if (!message || typeof message !== "object") return "";
  const value = message as { content?: unknown; parts?: unknown; text?: unknown };
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
    .join(" ");
}
