"use client";

import { AssistantRuntimeProvider, Tools, useAui } from "@assistant-ui/react";
import { AssistantChatTransport, useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { toolkit } from "./toolkit";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";

export function Assistant() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({ api: "/api/chat" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const aui = useAui({
    tools: Tools({ toolkit }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime} aui={aui}>
      <div className="flex h-full overflow-hidden border-t border-border/60 bg-background">
        <aside className="hidden w-80 flex-col border-r border-border/60 bg-muted/30 md:flex">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
                <img src="/debo.png" alt="Debo" className="size-6 object-contain" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-foreground">Debo Chat</h2>
                <p className="text-xs text-muted-foreground">Ask, plan, and search</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
            <ThreadList />
          </div>
        </aside>
        <main className="relative flex flex-1 flex-col bg-background">
          <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3 md:hidden">
            <div className="flex size-9 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
              <img src="/debo.png" alt="Debo" className="size-5 object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">Debo Chat</h1>
              <p className="text-xs text-muted-foreground">How can I help?</p>
            </div>
          </div>
          <Thread />
        </main>
      </div>
    </AssistantRuntimeProvider>
  );
}
