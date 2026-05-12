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
      <div className="flex h-full overflow-hidden border-t border-border/50">
        <aside className="w-80 flex flex-col border-r border-border/50 bg-muted/20 p-6 hidden md:flex">
          <div className="mb-8 flex items-center gap-4 px-2">
            <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center border border-primary shadow-[0_4px_12px_rgba(37,99,235,0.2)] active:scale-95 transition-all overflow-hidden">
               <img src="/debo.png" alt="Debo" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground leading-none">Debo Engine</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Systems Active</span>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
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
