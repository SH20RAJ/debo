"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import type { ThreadHistoryAdapter } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { ReactNode } from "react";

/**
 * ThreadHistoryAdapter that persists messages to our Postgres DB
 * via the /api/chat/history endpoints.
 */
const historyAdapter: ThreadHistoryAdapter = {
  async load() {
    return { headId: null, messages: [] };
  },
  async append() {},

  withFormat: (fmt) => ({
    async load() {
      // The threadId is managed by the runtime — for initial load we return empty
      // The chat transport handles message delivery; history is supplementary
      return { messages: [] };
    },
    async append(item) {
      try {
        await fetch("/api/chat/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: fmt.getId(item.message),
            parent_id: item.parentId,
            format: fmt.format,
            content: fmt.encode(item),
            threadId: "current", // The server will resolve
          }),
        });
      } catch (e) {
        console.error("Failed to persist message:", e);
      }
    },
  }),
};

export function MyAssistantRuntimeProvider({ children }: { children: ReactNode }) {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
    adapters: {
      history: historyAdapter,
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
