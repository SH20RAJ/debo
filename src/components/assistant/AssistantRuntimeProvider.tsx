"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { ReactNode, useMemo } from "react";

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

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
    adapters: {
      history: historyAdapter as any,
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
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
