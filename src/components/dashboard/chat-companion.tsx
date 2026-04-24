"use client";

import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/thread";

export function ChatCompanion() {
    const runtime = useChatRuntime({
        transport: new AssistantChatTransport({
            api: "/api/chat",
        }),
    });

    return (
        <div className="flex-1 flex flex-col w-full h-full bg-background overflow-hidden">
            <AssistantRuntimeProvider runtime={runtime}>
                <Thread />
            </AssistantRuntimeProvider>
        </div>
    );
}
