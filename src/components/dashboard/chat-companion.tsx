"use client";

import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/thread";

export function ChatCompanion() {
    const runtime = useChatRuntime({
        api: "/api/chat",
    });

    return (
        <div className="h-[calc(100vh-12rem)] flex flex-col border rounded-xl bg-card shadow-sm overflow-hidden">
            <AssistantRuntimeProvider runtime={runtime}>
                <Thread />
            </AssistantRuntimeProvider>
        </div>
    );
}
