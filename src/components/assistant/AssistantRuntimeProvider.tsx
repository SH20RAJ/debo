"use client";

import {
  AssistantRuntimeProvider,
  useRemoteThreadListRuntime,
  type RemoteThreadListAdapter,
} from "@assistant-ui/react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { useAui, useAuiState } from "@assistant-ui/store";
import { AssistantChatTransport, useAISDKRuntime } from "@assistant-ui/react-ai-sdk";
import type { ChatTransport } from "ai";
import { ReactNode, useEffect, useMemo, useRef } from "react";

export function MyAssistantRuntimeProvider({ children }: { children: ReactNode }) {
  const historyAdapter = useMemo(() => ({
    async load() {
      return { headId: null, messages: [] };
    },
    async append() {},
    withFormat: (fmt: any) => ({
      async load() {
        try {
          const res = await fetch("/api/chat/history?threadId=current", {
            cache: "no-store",
          });
          if (!res.ok) return { messages: [] };
          const rows = (await res.json()) as Array<{ id: string }>;
          return {
            headId: rows.at(-1)?.id ?? null,
            messages: rows.map((row: any) => fmt.decode(row)),
          };
        } catch (e) {
          console.error("Failed to load history:", e);
          return { messages: [] };
        }
      },
      async append(item: any) {
        await persistHistoryItem(fmt, item);
      },
      async update(item: any) {
        await persistHistoryItem(fmt, item);
      },
    }),
  }), []);

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/chat",
      }),
    []
  );

  const threadListAdapter = useMemo(() => createThreadListAdapter(), []);
  const initialThreadId = useMemo(() => readBrowserActiveThreadId() ?? undefined, []);

  const runtime = useRemoteThreadListRuntime({
    runtimeHook: function RuntimeHook() {
      return useDeboChatThreadRuntime(transport, historyAdapter);
    },
    adapter: threadListAdapter,
    initialThreadId,
    allowNesting: true,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
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
  transport: AssistantChatTransport<any>,
  historyAdapter: Record<string, unknown>
) {
  const dynamicTransport = useDynamicChatTransport(transport as ChatTransport<any>);
  const id = useAuiState((state) => state.threadListItem.id);
  const aui = useAui();
  const chat = useChat({
    id,
    transport: dynamicTransport,
  });

  const runtime = useAISDKRuntime(chat, {
    adapters: {
      history: historyAdapter as any,
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

function createEmptyAssistantStream() {
  return new ReadableStream();
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
    async initialize() {
      const remoteId = crypto.randomUUID();
      setBrowserActiveThreadId(remoteId);

      const res = await fetch("/api/chat/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: remoteId }),
      });

      if (!res.ok && res.status !== 401) {
        throw new Error(`Thread create failed with ${res.status}`);
      }

      return { remoteId, externalId: remoteId };
    },
    async fetch(threadId) {
      const res = await fetch("/api/chat/threads", { cache: "no-store" });
      if (!res.ok) throw new Error("Thread not found");

      const data = (await res.json()) as {
        threads?: Array<{ id: string; title?: string | null }>;
      };
      const thread = data.threads?.find((item) => item.id === threadId);
      if (!thread) throw new Error("Thread not found");

      setBrowserActiveThreadId(thread.id);
      return {
        remoteId: thread.id,
        externalId: thread.id,
        status: "regular" as const,
        title: thread.title || "New Chat",
      };
    },
    async rename(remoteId, newTitle) {
      await fetch("/api/chat/threads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: remoteId, title: newTitle }),
      });
    },
    async archive() {},
    async unarchive() {},
    async delete(remoteId) {
      await fetch(`/api/chat/threads?id=${encodeURIComponent(remoteId)}`, {
        method: "DELETE",
      });
    },
    async generateTitle() {
      return createEmptyAssistantStream();
    },
  };
}

async function persistHistoryItem(fmt: any, item: any) {
  try {
    const res = await fetch("/api/chat/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: fmt.getId(item.message),
        parent_id: item.parentId,
        format: fmt.format,
        content: fmt.encode(item),
        threadId: "current",
      }),
    });

    if (!res.ok) {
      throw new Error(`History API returned ${res.status}`);
    }
  } catch (e) {
    console.error("Failed to persist message:", e);
  }
}
