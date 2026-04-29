"use client";

import { useMemo } from "react";
import { BookOpenText, ChevronRight, Plus, Trash2 } from "lucide-react";

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
    <aside className="flex h-full w-full flex-col border-r border-border/60 bg-background/95 backdrop-blur-xl md:w-[19rem]">
      <div className="border-b border-border/60 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground/60">Chat History</p>
            <h2 className="mt-1 text-sm font-semibold text-foreground">Persistent conversations</h2>
          </div>
          <Button size="icon" variant="outline" className="size-9 rounded-xl" onClick={onCreateChat} aria-label="New chat">
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {isLoading ? (
          <div className="space-y-3 p-2 text-sm text-muted-foreground">Loading chats…</div>
        ) : sortedChats.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
            Start a new conversation to store your first durable chat memory.
          </div>
        ) : (
          <div className="space-y-2">
            {sortedChats.map((chat) => {
              const isActive = chat.id === activeChatId;
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "group flex items-center gap-2 rounded-2xl border px-3 py-3 transition-all",
                    isActive
                      ? "border-primary/30 bg-primary/5 shadow-sm"
                      : "border-border/60 bg-background/40 hover:border-primary/20 hover:bg-primary/5"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelectChat(chat.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                      <BookOpenText className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {chat.title || "New Conversation"}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        Updated {formatRelativeDate(chat.updatedAt)}
                      </span>
                    </span>
                    <ChevronRight className={cn("size-4 shrink-0 transition-opacity", isActive ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-100 text-muted-foreground")} />
                  </button>

                  {onDeleteChat && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-8 shrink-0 rounded-xl text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
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