"use client";

import {
  AssistantRuntimeProvider,
  useRemoteThreadListRuntime,
  type RemoteThreadListAdapter,
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

type HistoryItem = {
  parentId: string | null;
  message: UIMessage;
};

type StorageFormatter = {
  format: string;
  encode(item: HistoryItem): Record<string, unknown>;
  decode(row: ChatHistoryRow): HistoryItem;
  getId(message: UIMessage): string;
};

export function MyAssistantRuntimeProvider({
  children,
  initialThreadId,
}: MyAssistantRuntimeProviderProps) {
  const activeThreadIdRef = useRef<string | null>(initialThreadId ?? null);

  useEffect(() => {
    if (!initialThreadId) return;
    activeThreadIdRef.current = initialThreadId;
    setBrowserActiveThreadId(initialThreadId);
  }, [initialThreadId]);

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/chat",
      }),
    []
  );

  const threadListAdapter = useMemo(() => createThreadListAdapter(), []);
  const runtimeInitialThreadId = useMemo(
    () => initialThreadId ?? readBrowserActiveThreadId() ?? undefined,
    [initialThreadId]
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
  const threadId = useAuiState((state) => state.threadListItem.id);
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

function createHistoryAdapter(aui: ReturnType<typeof useAui>) {
  return {
    async load() {
      return { headId: null, messages: [] };
    },
    async append() {},
    withFormat: (fmt: StorageFormatter) => ({
      async load() {
        try {
          const threadId = aui.threadListItem().getState().remoteId;
          if (!threadId) return { messages: [] };

          const res = await fetch(`/api/chat/history?threadId=${encodeURIComponent(threadId)}`, {
            cache: "no-store",
          });
          if (!res.ok) return { messages: [] };
          const rows = (await res.json()) as ChatHistoryRow[];
          return {
            headId: rows.at(-1)?.id ?? null,
            messages: rows.map((row) => fmt.decode(row)),
          };
        } catch (e) {
          console.error("Failed to load history:", e);
          return { messages: [] };
        }
      },
      async append(item: HistoryItem) {
        const { remoteId } = await aui.threadListItem().initialize();
        setBrowserActiveThreadId(remoteId);
        await persistHistoryItem(fmt, item, remoteId);
      },
      async update(item: HistoryItem) {
        const remoteId = aui.threadListItem().getState().remoteId;
        if (!remoteId) return;
        await persistHistoryItem(fmt, item, remoteId);
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
    const nextThreadId = remoteId ?? id;
    if (!nextThreadId) return;
    activeThreadIdRef.current = nextThreadId;
    setBrowserActiveThreadId(nextThreadId);
  }, [activeThreadIdRef, id, remoteId]);

  const chat = useChat({
    id: remoteId ?? id ?? activeThreadIdRef.current ?? undefined,
    transport: dynamicTransport,
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
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function setBrowserActiveThreadId(threadId: string) {
  if (typeof document === "undefined") return;
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
      try {
        const res = await fetch("/api/chat/threads", { cache: "no-store" });
        if (!res.ok) return { threads: [] };
        const data = (await res.json()) as {
          threads?: Array<{ id: string; title?: string | null }>;
        };

        return {
          threads: (data.threads ?? []).map((thread) => ({
            remoteId: thread.id,
            externalId: thread.id,
            status: "regular" as const,
            title: thread.title || "New Chat",
          })),
        };
      } catch (error) {
        console.error("Failed to load chat threads:", error);
        return { threads: [] };
      }
    },
    async initialize(localId) {
      const remoteId = localId || crypto.randomUUID();
      setBrowserActiveThreadId(remoteId);

      const res = await fetch("/api/chat/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: remoteId }),
      });

      if (!res.ok) {
        throw new Error(`Thread create failed with ${res.status}`);
      }

      const thread = await res.json() as { id?: string };
      const resolvedId = thread.id || remoteId;
      setBrowserActiveThreadId(resolvedId);

      return { remoteId: resolvedId, externalId: resolvedId };
    },
    async fetch(threadId) {
      const res = await fetch(`/api/chat/threads?id=${encodeURIComponent(threadId)}`, {
        cache: "no-store",
      });

      if (res.status === 404) {
        const createRes = await fetch("/api/chat/threads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: threadId }),
        });

        if (!createRes.ok) throw new Error("Thread not found");

        const thread = await createRes.json() as { id: string; title?: string | null };
        setBrowserActiveThreadId(threadId);
        return {
          remoteId: thread.id,
          externalId: thread.id,
          status: "regular" as const,
          title: thread.title || "New Chat",
        };
      }

      if (!res.ok) throw new Error("Thread not found");

      const thread = (await res.json()) as { id: string; title?: string | null };
      setBrowserActiveThreadId(thread.id);
      return {
        remoteId: thread.id,
        externalId: thread.id,
        status: "regular" as const,
        title: thread.title || "New Chat",
      };
    },
    async rename(remoteId, newTitle) {
      const res = await fetch("/api/chat/threads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: remoteId, title: newTitle }),
      });
      if (!res.ok) throw new Error(`Thread rename failed with ${res.status}`);
    },
    async archive() {},
    async unarchive() {},
    async delete(remoteId) {
      const res = await fetch(`/api/chat/threads?id=${encodeURIComponent(remoteId)}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 404) {
        throw new Error(`Thread delete failed with ${res.status}`);
      }
      clearBrowserActiveThreadId(remoteId);
    },
    async generateTitle(remoteId, unstableMessages) {
      const title = createTitleFromMessages(unstableMessages);
      await fetch("/api/chat/threads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: remoteId, title }),
      });

      return createAssistantStream((controller) => {
        controller.appendText(title);
      });
    },
  };
}

async function persistHistoryItem(
  fmt: StorageFormatter,
  item: HistoryItem,
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
