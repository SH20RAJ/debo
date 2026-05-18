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
           
          </div>
          <div className="relative z-10 min-h-0 flex-1 px-0">
            <Thread />
          </div>
        </main>
      </div>
    </AssistantRuntimeProvider>
  );
}
