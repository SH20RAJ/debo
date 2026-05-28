"use client";

import { cn } from "@/lib/utils";
import { Brain, Circle } from "lucide-react";
import type { MailThread } from "./mail-shell";

interface MailThreadListProps {
  threads: MailThread[];
  selectedId: string | null;
  loading?: boolean;
  onSelect: (id: string) => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  if (days === 1) return "Yesterday";
  if (days < 7) return date.toLocaleDateString("en-US", { weekday: "short" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(address: string): string {
  const name = address.split("@")[0];
  return name.slice(0, 2).toUpperCase();
}

export function MailThreadList({ threads, selectedId, loading = false, onSelect }: MailThreadListProps) {
  if (loading) {
    return (
      <div className="h-full p-3 space-y-2">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-xl border border-border/50 p-3">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 rounded bg-muted" />
                <div className="h-3 w-4/5 rounded bg-muted" />
                <div className="h-2 w-full rounded bg-muted/70" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-8">
        <div className="text-center">
          <p className="text-sm font-medium">No messages</p>
          <p className="text-xs mt-1">This folder is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {threads.map((thread) => {
        const isUnread = thread.participant?.role === "recipient" && !thread.participant?.lastReadAt;
        const isSelected = selectedId === thread.id;
        const sender = thread.lastMessage?.senderAddress || "";
        const preview = thread.lastMessage?.body || "";
        const isMemorySaved = thread.lastMessage?.isMemorySaved === 1;

        return (
          <button
            key={thread.id}
            onClick={() => onSelect(thread.id)}
            className={cn(
              "w-full text-left px-4 py-3 border-b border-border/50 transition-colors hover:bg-accent/50",
              isSelected && "bg-accent/70 border-l-2 border-l-primary",
              isUnread && "bg-primary/[0.03]"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                isUnread ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {getInitials(sender)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    "text-sm truncate",
                    isUnread ? "font-bold text-foreground" : "font-medium text-foreground/80"
                  )}>
                    {sender.split("@")[0]}
                  </span>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {formatDate(thread.lastMessageAt)}
                  </span>
                </div>

                <p className={cn(
                  "text-sm truncate mt-0.5",
                  isUnread ? "font-semibold text-foreground" : "text-muted-foreground"
                )}>
                  {thread.subject}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground truncate flex-1">
                    {preview.slice(0, 80)}{preview.length > 80 ? "..." : ""}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    {isMemorySaved && (
                      <Brain className="w-3 h-3 text-primary" />
                    )}
                    {isUnread && (
                      <Circle className="w-2 h-2 fill-primary text-primary" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
