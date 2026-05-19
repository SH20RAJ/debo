"use client";

import { Brain, Bookmark, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MailThread, MailMessage } from "./mail-shell";

interface MailThreadDetailProps {
  thread: MailThread;
  messages: MailMessage[];
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MailThreadDetail({ thread, messages }: MailThreadDetailProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground">{thread.subject}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Save to memory">
              <Brain className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Star">
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="More">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {messages.map((msg) => {
          const isSentByMe = msg.senderAddress.includes("shaswat"); // simplified for mock

          return (
            <div key={msg.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                  isSentByMe ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"
                )}>
                  {msg.senderAddress.split("@")[0].slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {msg.senderAddress.split("@")[0]}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {msg.senderAddress}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    to {msg.recipientAddress}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {msg.isMemorySaved === 1 && (
                    <span className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                      <Brain className="w-3 h-3" />
                      Memory saved
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatFullDate(msg.createdAt)}
                  </span>
                </div>
              </div>

              <div className="pl-11">
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {msg.body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick reply placeholder */}
      <div className="shrink-0 px-6 py-4 border-t border-border">
        <div className="bg-muted/50 rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-text">
          Reply to this message...
        </div>
      </div>
    </div>
  );
}
