"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { SourceCitation, type SourceData } from "./source-citation";
import { SuggestedActions } from "./suggested-actions";
import { Brain, Sparkles } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceData[];
  suggestedActions?: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  isTyping?: boolean;
}

interface ChatAreaProps {
  messages: Message[];
  onPromptClick?: (prompt: string) => void;
}

const EMPTY_PROMPTS = [
  "What did I promise Raj?",
  "What ideas did I save about Debo?",
  "Summarize my last 7 days",
];

export function ChatArea({ messages, onPromptClick }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
          <Brain className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Ask your past anything.
        </h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-sm text-center">
          Debo searches your memories and shows sources for every answer.
        </p>
        <div className="flex flex-col gap-2 w-full max-w-md">
          {EMPTY_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onPromptClick?.(prompt)}
              className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl border border-border bg-card hover:bg-muted/50 transition-colors group"
            >
              <Sparkles className="w-4 h-4 text-primary/60 shrink-0" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {prompt}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "flex",
            msg.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "max-w-[85%] lg:max-w-[70%]",
              msg.role === "user" ? "order-1" : "order-1"
            )}
          >
            {/* Message bubble */}
            <div
              className={cn(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border rounded-bl-md"
              )}
            >
              {msg.isTyping ? (
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:0.3s]" />
                </div>
              ) : (
                <span className={msg.role === "user" ? "" : "text-foreground"}>
                  {msg.content}
                </span>
              )}
            </div>

            {/* Sources for assistant messages */}
            {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && !msg.isTyping && (
              <div className="mt-2 space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-1">
                  Sources
                </p>
                {msg.sources.map((source) => (
                  <SourceCitation key={source.id} source={source} />
                ))}
              </div>
            )}

            {/* Suggested actions */}
            {msg.role === "assistant" && msg.suggestedActions && !msg.isTyping && (
              <SuggestedActions actions={msg.suggestedActions} />
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
