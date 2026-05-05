"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { ReactNode, useMemo } from "react";

export function MyAssistantRuntimeProvider({ children }: { children: ReactNode }) {
  const historyAdapter = useMemo(() => ({
    async load({ threadId }: { threadId: string }) {
      if (!threadId || threadId === "new") return { messages: [] };
      try {
        const res = await fetch(`/api/chat/history?threadId=${threadId}`);
        if (!res.ok) return { messages: [] };
        const messages = await res.json();
        return { messages };
      } catch (e) {
        console.error("Failed to load history:", e);
        return { messages: [] };
      }
    },
    withFormat: (fmt: any) => ({
      async load({ threadId }: { threadId: string }) {
        if (!threadId || threadId === "new") return { messages: [] };
        try {
          const res = await fetch(`/api/chat/history?threadId=${threadId}`);
          if (!res.ok) return { messages: [] };
          const messages = await res.json();
          return { messages };
        } catch (e) {
          console.error("Failed to load history:", e);
          return { messages: [] };
        }
      },
      async append(item: any) {
        // Try to get threadId from metadata or item
        // In assistant-ui, we can't easily get the current threadId here
        // so the server will have to resolve it or we use a convention.
        try {
          await fetch("/api/chat/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: fmt.getId(item.message),
              parent_id: item.parentId,
              format: fmt.format,
              content: fmt.encode(item),
              threadId: "current", // Resolved by session on server
            }),
          });
        } catch (e) {
          console.error("Failed to persist message:", e);
        }
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
