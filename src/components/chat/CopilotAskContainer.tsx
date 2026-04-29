"use client";

import { useState, useCallback, useEffect } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";
import { AgentDataRenderer } from "@/components/copilot/AgentDataRenderer";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { getUserChats, createChat, deleteChat } from "@/actions/chat";
import { toast } from "sonner";

type ChatSummary = {
  id: string;
  title: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function CopilotAskContainer() {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | undefined>();
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  const refreshChats = useCallback(async (preferredChatId?: string) => {
    setIsLoadingChats(true);
    try {
      const existingChats = (await getUserChats()) as ChatSummary[];
      setChats(existingChats);

      const storedChatId = typeof window !== "undefined" ? window.localStorage.getItem("debo.copilot.activeChatId") : null;
      const nextChatId = preferredChatId || storedChatId || (existingChats.length > 0 ? existingChats[0].id : undefined);

      if (nextChatId && existingChats.some((chat) => chat.id === nextChatId)) {
        setActiveChatId(nextChatId);
      } else {
        setActiveChatId(undefined);
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
      toast.error("Could not load chat history.");
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  useEffect(() => {
    void refreshChats();
  }, [refreshChats]);

  useEffect(() => {
    if (typeof window !== "undefined" && activeChatId) {
      window.localStorage.setItem("debo.copilot.activeChatId", activeChatId);
    }
  }, [activeChatId]);

  const handleCreateChat = useCallback(async () => {
    try {
      const newChatId = await createChat("New Conversation");
      setActiveChatId(newChatId);
      await refreshChats(newChatId);
    } catch (error) {
      console.error("Failed to create chat:", error);
      toast.error("Could not create a new conversation.");
    }
  }, [refreshChats]);

  const handleDeleteChat = useCallback(async (chatId: string) => {
    try {
      await deleteChat(chatId);
      const nextChats = chats.filter((chat) => chat.id !== chatId);
      setChats(nextChats);
      
      if (activeChatId === chatId) {
        const nextActive = nextChats[0]?.id;
        setActiveChatId(nextActive);
        if (typeof window !== "undefined") {
          if (nextActive) {
            window.localStorage.setItem("debo.copilot.activeChatId", nextActive);
          } else {
            window.localStorage.removeItem("debo.copilot.activeChatId");
          }
        }
      }
      toast.success("Conversation deleted.");
    } catch (error) {
      console.error("Delete chat failed:", error);
      toast.error("Could not delete the conversation.");
    }
  }, [activeChatId, chats]);

  useCopilotReadable({
    description: "The list of previous conversations and the current active conversation ID.",
    value: JSON.stringify({
      activeChatId,
      chats: chats.map(c => ({ id: c.id, title: c.title })),
    }),
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[560px] flex-col overflow-hidden bg-background md:h-[calc(100vh-3.5rem)] md:flex-row">
      <AgentDataRenderer />
      
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId || null}
        onSelectChat={(id) => setActiveChatId(id)}
        onCreateChat={() => void handleCreateChat()}
        onDeleteChat={handleDeleteChat}
        isLoading={isLoadingChats}
      />

      <div className="flex-1 relative h-full">
        <CopilotChat
          key={activeChatId || "new"}
          instructions={"You are Debo, the user's life intelligence assistant. You have access to their journals and memories. Be helpful, insightful, and concise. Use the provided tools to render data when relevant."}
          labels={{
            title: "Debo Intelligence",
            initial: "Ask me anything about your past journals, patterns, or insights.",
          }}
          className="h-full"
        />
      </div>
    </div>
  );
}
