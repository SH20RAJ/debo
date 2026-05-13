"use client";

import { AssistantRuntimeProvider, Tools, useAui } from "@assistant-ui/react";
import { AssistantChatTransport, useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { toolkit } from "./toolkit";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { PanelLeftIcon, SparklesIcon } from "lucide-react";

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
      <div className="flex h-full overflow-hidden bg-background">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-border/40 bg-muted/20 xl:flex">
          <div className="border-b border-border/40 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-background">
                <img src="/debo.png" alt="Debo" className="size-6 object-contain" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-foreground">Debo Chat</h2>
                <p className="text-xs text-muted-foreground">Recent conversations</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
            <ThreadList />
          </div>
        </aside>
        <main className="relative flex min-w-0 flex-1 flex-col bg-background">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 border-b border-border/30 bg-muted/20" />
          <div className="relative z-10 flex items-center justify-between px-4 py-4 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden size-9 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground xl:flex">
                <PanelLeftIcon className="size-4" />
              </div>
              <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm xl:hidden">
                <img src="/debo.png" alt="Debo" className="size-6 object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-foreground">Talk to Debo</h1>
                <p className="truncate text-xs text-muted-foreground">Plain chat first. Tools only when you ask.</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-sm md:flex">
              <SparklesIcon className="size-3.5 text-primary" />
              Calm mode
            </div>
          </div>
          <div className="relative z-10 min-h-0 flex-1">
            <Thread />
          </div>
        </main>
      </div>
    </AssistantRuntimeProvider>
  );
}
