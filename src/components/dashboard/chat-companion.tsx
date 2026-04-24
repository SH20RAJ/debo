"use client";

import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider, type ThreadHistoryAdapter } from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/thread";
import { useChatsStore } from "@/lib/chats-store";
import { useEffect, useMemo } from "react";
import { CalendarToolUI, EmailToolUI, JournalToolUI, JournalSearchToolUI } from "@/components/assistant-ui/tool-ui";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export function ChatCompanion() {
    const { activeChatId, setActiveChatId, fetchChats } = useChatsStore();
    
    // If no active chat, create one. But we want to preserve it across navigation.
    const threadId = useMemo(() => activeChatId || crypto.randomUUID(), [activeChatId]);

    useEffect(() => {
        if (!activeChatId) {
            setActiveChatId(threadId);
        }
    }, [activeChatId, threadId, setActiveChatId]);

    const historyAdapter: ThreadHistoryAdapter = useMemo(() => ({
        async load() {
            const response = await fetch(`/api/chat/history?chatId=${threadId}`);
            if (!response.ok) return { messages: [] };
            return await response.json();
        },
        async append({ message, parentId }) {
            const isNewChat = !activeChatId;
            await fetch("/api/chat/history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    chatId: threadId, 
                    message, 
                    parentId,
                    title: message.role === "user" 
                        ? (typeof message.content === "string" 
                            ? (message.content as string).substring(0, 30) 
                            : Array.isArray(message.content) 
                                ? (message.content as any[]).map((c: any) => c.text || "").join("").substring(0, 30)
                                : undefined)
                        : undefined
                }),
            });
            if (isNewChat) fetchChats();
        },
    }), [threadId, activeChatId, fetchChats]);

    const runtime = useChatRuntime({
        transport: new AssistantChatTransport({
            api: "/api/chat",
            body: { chatId: threadId },
        }),
        adapters: {
            history: historyAdapter,
        },
    });

    return (
        <div className="flex-1 flex flex-col w-full h-full bg-background overflow-hidden relative">
            <div className="absolute top-4 right-4 z-20">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 rounded-full shadow-sm"
                    onClick={() => setActiveChatId(null)}
                >
                    <PlusIcon className="h-4 w-4" />
                    New Chat
                </Button>
            </div>
            <AssistantRuntimeProvider runtime={runtime}>
                <CalendarToolUI />
                <EmailToolUI />
                <JournalToolUI />
                <JournalSearchToolUI />
                <Thread />
            </AssistantRuntimeProvider>
        </div>
    );
}
