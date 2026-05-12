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
      <div className="grid h-[calc(100vh-100px)] grid-cols-[280px_1fr] gap-0 overflow-hidden rounded-2xl border-4 border-duo-swan bg-background shadow-[0_8px_0_var(--duo-swan)]">
        <aside className="border-r-4 border-duo-swan bg-duo-polar/50 p-4">
          <div className="mb-6 flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-xl bg-duo-macaw flex items-center justify-center shadow-[0_4px_0_#1899D6]">
              <span className="text-xl font-black text-white">D</span>
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-duo-wolf">Debo Chat</h2>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-duo-feather animate-pulse" />
                <span className="text-[10px] font-bold text-duo-wolf/60 uppercase">Online</span>
              </div>
            </div>
          </div>
          <ThreadList />
        </aside>
        <main className="relative flex flex-col bg-background">
          <Thread />
        </main>
      </div>
    </AssistantRuntimeProvider>
  );
}
