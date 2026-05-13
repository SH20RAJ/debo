"use client";

import { AssistantRuntimeProvider, Tools, useAui } from "@assistant-ui/react";
import { AssistantChatTransport, useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { toolkit } from "./toolkit";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { SparklesIcon } from "lucide-react";

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
        <main className="relative flex min-w-0 flex-1 flex-col bg-background">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 border-b border-border/30 bg-muted/15" />
          <div className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm">
                <img src="/debo.png" alt="Debo" className="size-6 object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-foreground">Debo Chat</h1>
                <p className="truncate text-xs text-muted-foreground">Memory-aware. Tools only when you ask.</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-sm md:flex">
              <SparklesIcon className="size-3.5 text-primary" />
              Clean mode
            </div>
          </div>
          <div className="relative z-10 min-h-0 flex-1 px-0">
            <Thread />
          </div>
        </main>
      </div>
    </AssistantRuntimeProvider>
  );
}
