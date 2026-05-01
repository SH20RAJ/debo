"use client";

import { useMemo } from "react";
import { MessageSquareText, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatSummary = {
  id: string;
  title: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type ChatSidebarProps = {
  chats: ChatSummary[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: () => void;
  onDeleteChat?: (chatId: string) => void;
  isLoading?: boolean;
};

export function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  isLoading,
}: ChatSidebarProps) {
  const sortedChats = useMemo(
    () => [...chats].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()),
    [chats]
  );

  return (
    <aside className="hidden h-full w-[17rem] shrink-0 flex-col border-r border-border/60 bg-muted/20 md:flex">
      <div className="border-b border-border/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-normal text-muted-foreground">Chats</p>
            <h2 className="mt-1 text-sm font-semibold tracking-normal text-foreground">Ask Debo</h2>
          </div>
          <Button size="icon" variant="outline" className="size-8" onClick={onCreateChat} aria-label="New chat">
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {isLoading ? (
          <div className="space-y-2 p-1">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-9 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : sortedChats.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 bg-background/60 p-3 text-sm leading-5 text-muted-foreground">
            Start a conversation to keep it available here.
          </div>
        ) : (
          <div className="space-y-1">
            {sortedChats.map((chat) => {
              const isActive = chat.id === activeChatId;
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "group flex items-center gap-1 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelectChat(chat.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md">
                      <MessageSquareText className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {chat.title || "New Conversation"}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        Updated {formatRelativeDate(chat.updatedAt)}
                      </span>
                    </span>
                  </button>

                  {onDeleteChat && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="mr-1 size-7 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      onClick={() => onDeleteChat(chat.id)}
                      aria-label={`Delete ${chat.title || "conversation"}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

function formatRelativeDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
