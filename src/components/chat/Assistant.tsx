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
      <div className="flex h-full overflow-hidden border-t-2 border-border/20">
        <aside className="w-80 flex flex-col border-r-2 border-border/20 bg-muted/30 p-6 hidden md:flex">
          <div className="mb-8 flex items-center gap-4 px-2">
            <div className="h-12 w-12 rounded-[1.25rem] bg-duo-macaw flex items-center justify-center border-2 border-duo-macaw shadow-[0_4px_0_var(--duo-macaw-shadow)] active:translate-y-1 active:shadow-none transition-all">
               <img src="/debo.png" alt="Debo" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground leading-none">Debo AI</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="relative">
                  <div className="h-2 w-2 rounded-full bg-duo-feather shadow-[0_0_8px_var(--duo-feather)]" />
                  <div className="absolute inset-0 h-2 w-2 rounded-full bg-duo-feather animate-ping opacity-75" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-duo-feather">Active Now</span>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <ThreadList />
          </div>
        </aside>
        <main className="relative flex-1 flex flex-col bg-background">
          <Thread />
        </main>
      </div>
    </AssistantRuntimeProvider>
  );
}
