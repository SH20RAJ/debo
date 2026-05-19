"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SourceCitation, type SourceData } from "./source-citation";
import { SuggestedActions, type ActionItem } from "./suggested-actions";
import { Brain, Sparkles } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceData[];
  suggestedActions?: ActionItem[];
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
            <Button
              key={prompt}
              variant="outline"
              onClick={() => onPromptClick?.(prompt)}
              className="justify-start gap-3 h-auto px-4 py-3 rounded-2xl border-border bg-card hover:bg-muted/50 text-sm font-normal text-muted-foreground"
            >
              <Sparkles className="w-4 h-4 text-primary/60 shrink-0" />
              {prompt}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="px-4 py-6 space-y-6">
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
                "max-w-[85%] lg:max-w-[70%]"
              )}
            >
              {/* Message bubble */}
              {msg.role === "user" ? (
                <Card className="rounded-2xl rounded-br-md border-0 bg-primary text-primary-foreground px-4 py-3 shadow-[0_3px_0_#46A302]">
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </Card>
              ) : (
                <Card className="rounded-2xl rounded-bl-md border-2 border-border bg-card px-4 py-3 shadow-sm">
                  {msg.isTyping ? (
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:0.3s]" />
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-foreground">
                      {msg.content}
                    </p>
                  )}
                </Card>
              )}

              {/* Sources for assistant messages */}
              {msg.role === "assistant" &&
                msg.sources &&
                msg.sources.length > 0 &&
                !msg.isTyping && (
                  <div className="mt-2 space-y-1">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                      Sources
                    </p>
                    {msg.sources.map((source) => (
                      <SourceCitation key={source.id} source={source} />
                    ))}
                  </div>
                )}

              {/* Suggested actions */}
              {msg.role === "assistant" &&
                msg.suggestedActions &&
                !msg.isTyping && (
                  <SuggestedActions actions={msg.suggestedActions} />
                )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
