"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { UIMessage } from "ai";
import { toast } from "sonner";

import { createChat, deleteChat, getChatHistory, getUserChats } from "@/actions/chat";

import { ChatSession } from "./ChatSession";
import { ChatSidebar } from "./ChatSidebar";

type ChatSummary = {
  id: string;
  title: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type ChatMessageRecord = {
  id: string;
  role: string;
  content: string;
  metadata?: string | null;
  createdAt: Date | string;
};

export function ChatContainer() {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const activeChatTitle = useMemo(
    () => chats.find((chat) => chat.id === activeChatId)?.title || "Ask Debo",
    [activeChatId, chats]
  );

  const refreshChats = useCallback(async (preferredChatId?: string) => {
    setIsLoadingChats(true);
    try {
      const existingChats = (await getUserChats()) as ChatSummary[];
      setChats(existingChats);

      const storedChatId = typeof window !== "undefined" ? window.localStorage.getItem("debo.activeChatId") : null;
      const nextChatId = preferredChatId || storedChatId || activeChatId || existingChats[0]?.id || null;

      if (nextChatId && existingChats.some((chat) => chat.id === nextChatId)) {
        setActiveChatId(nextChatId);
      } else if (!nextChatId) {
        setActiveChatId(null);
        setInitialMessages([]);
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
      toast.error("Could not load chat history.");
    } finally {
      setIsLoadingChats(false);
    }
  }, [activeChatId]);

  useEffect(() => {
    void refreshChats();
  }, [refreshChats]);

  useEffect(() => {
    if (typeof window !== "undefined" && activeChatId) {
      window.localStorage.setItem("debo.activeChatId", activeChatId);
    }
  }, [activeChatId]);

  useEffect(() => {
    if (!activeChatId) {
      setInitialMessages([]);
      return;
    }

    let cancelled = false;

    const loadHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const history = (await getChatHistory(activeChatId)) as ChatMessageRecord[];
        if (cancelled) return;

        setInitialMessages(history.map(recordToUIMessage));
      } catch (error) {
        console.error("Failed to load chat history:", error);
        if (!cancelled) {
          toast.error("Could not load this conversation.");
          setInitialMessages([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingHistory(false);
        }
      }
    };

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [activeChatId]);

  const createChatDraft = useCallback(async (title = "New Conversation") => {
    const chatId = await createChat(title);
    return chatId;
  }, []);

  const handleCreateAndSelectChat = useCallback(async () => {
    const chatId = await createChatDraft("New Conversation");
    setActiveChatId(chatId);
    setInitialMessages([]);
    await refreshChats(chatId);
  }, [createChatDraft, refreshChats]);

  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
  }, []);

  const handleDeleteChat = useCallback(async (chatId: string) => {
    try {
      await deleteChat(chatId);
      const nextChats = chats.filter((chat) => chat.id !== chatId);
      setChats(nextChats);

      const nextActive = nextChats[0]?.id || null;
      setActiveChatId(nextActive);
      if (typeof window !== "undefined") {
        if (nextActive) {
          window.localStorage.setItem("debo.activeChatId", nextActive);
        } else {
          window.localStorage.removeItem("debo.activeChatId");
        }
      }
      toast.success("Conversation deleted.");
    } catch (error) {
      console.error("Delete chat failed:", error);
      toast.error("Could not delete the conversation.");
    }
  }, [chats]);

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[560px] flex-col overflow-hidden bg-background md:h-[calc(100vh-2rem)] md:flex-row">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onCreateChat={() => void handleCreateAndSelectChat()}
        onDeleteChat={handleDeleteChat}
        isLoading={isLoadingChats}
      />

      <div className="relative min-w-0 flex-1">
        <ChatSession
          key={activeChatId || "new-chat"}
          chatId={activeChatId}
          title={activeChatTitle}
          initialMessages={initialMessages}
          onCreateChat={createChatDraft}
          onMessageCommitted={(chatId) => refreshChats(chatId || undefined)}
        />
        {isLoadingHistory && (
          <div className="pointer-events-none absolute inset-0 bg-background/30 backdrop-blur-[1px]" />
        )}
      </div>
    </div>
  );
}

function recordToUIMessage(record: ChatMessageRecord): UIMessage {
  return {
    id: record.id,
    role: record.role as UIMessage["role"],
    parts: recordToParts(record.content),
    metadata: parseMetadata(record.metadata),
  } as UIMessage;
}

function recordToParts(content: string) {
  return [{ type: "text" as const, text: content }];
}

function parseMetadata(value?: string | null) {
  if (!value) return undefined;

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}
