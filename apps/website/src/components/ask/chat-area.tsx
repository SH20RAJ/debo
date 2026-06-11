"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { SourceCitation, type SourceData } from "./source-citation";
import { SuggestedActions, type ActionItem } from "./suggested-actions";
import { Brain, Sparkles, ChevronDown, ChevronRight, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Markdown } from "../ui/markdown";
import { motion, AnimatePresence } from "framer-motion";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceData[];
  suggestedActions?: ActionItem[];
  isTyping?: boolean;
  retrievalActive?: boolean;
}

interface ChatAreaProps {
  messages: Message[];
  isResponding?: boolean;
  onPromptClick?: (prompt: string) => void;
}

const EMPTY_PROMPTS = [
  "Hey Debo 👋",
  "What can you do?",
  "What did I work on this week?",
  "Any open tasks or promises?",
];

export function ChatArea({ messages, isResponding, onPromptClick }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messages.map((m) => m.content).join("")]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 select-none">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.08)]"
        >
          <Brain className="w-7 h-7 text-emerald-500" />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-2xl font-extrabold text-foreground mb-2 font-[var(--font-nunito)] tracking-tight"
        >
          Talk to Debo
        </motion.h1>
        
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="text-sm text-muted-foreground mb-8 max-w-sm text-center font-medium leading-relaxed"
        >
          Say hi, or ask anything about your past. Real questions retrieve sources — casual chat just flows.
        </motion.p>
        
        <motion.div 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md"
        >
          {EMPTY_PROMPTS.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              onClick={() => onPromptClick?.(prompt)}
              className={cn(
                "justify-between gap-3 h-auto px-4 py-3.5 rounded-2xl border border-border bg-card hover:bg-accent/40",
                "hover:border-emerald-500/20 hover:shadow-[0_0_12px_rgba(16,185,129,0.05)] text-sm font-semibold text-foreground/80 hover:text-foreground transition-all duration-200 group"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Sparkles className="w-4 h-4 text-emerald-500/60 group-hover:text-emerald-500 shrink-0 transition-colors" />
                <span className="truncate">{prompt}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-emerald-500/60 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
            </Button>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 relative">
      <div className="h-full w-full absolute inset-0 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-emerald-500/25 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={cn(
              "flex w-full",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div className="max-w-[90%] md:max-w-[80%] lg:max-w-[70%]">
              {msg.role === "user" ? (
                // User Message
                <motion.div
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={cn(
                    "rounded-2xl rounded-tr-sm border border-emerald-500/10",
                    "bg-gradient-to-br from-emerald-500 to-green-600 text-white px-4 py-3 shadow-lg select-text",
                    "shadow-[0_3px_0_#388E02]"
                  )}>
                    <p className="text-sm font-semibold leading-relaxed tracking-wide">{msg.content}</p>
                  </Card>
                </motion.div>
              ) : (
                // Assistant Message Bubble
                <AssistantMessageBubble
                  message={msg}
                  isResponding={isResponding}
                  isLast={idx === messages.length - 1}
                />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

interface AssistantBubbleProps {
  message: Message;
  isResponding?: boolean;
  isLast: boolean;
}

function AssistantMessageBubble({ message, isResponding, isLast }: AssistantBubbleProps) {
  const [showThinking, setShowThinking] = useState(true);

  // Determine if there is retrieval active or sources found
  const hasSources = message.sources && message.sources.length > 0;
  const isSearching = message.retrievalActive;

  // Auto-collapse when content begins streaming
  useEffect(() => {
    if (!isSearching && message.content && isLast) {
      // Small timeout to let user see it complete before collapsing
      const timer = setTimeout(() => setShowThinking(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isSearching, message.content, isLast]);

  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="space-y-2"
    >
      <Card className={cn(
        "rounded-2xl rounded-bl-sm border border-border bg-card/85 backdrop-blur-xl px-5 py-4 shadow-xl select-text"
      )}>
        {/* Thinking Accordion (Tool call visualizer) */}
        {(isSearching || hasSources) && (
          <div className="mb-3.5 border border-border bg-muted/40 rounded-xl overflow-hidden shadow-inner">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-muted-foreground/80 hover:text-foreground hover:bg-accent/50 transition-all select-none cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Brain className={cn(
                  "w-3.5 h-3.5 text-emerald-500",
                  isSearching && "animate-pulse"
                )} />
                <span>
                  {isSearching
                    ? "Searching memory graph..."
                    : `Memory search complete (${message.sources?.length} sources queried)`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {isSearching && (
                  <Loader2 className="w-3 h-3 text-emerald-500/80 animate-spin mr-1" />
                )}
                {showThinking ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {showThinking && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-border"
                >
                  <div className="px-3 pb-3 pt-2 space-y-2.5 text-xs">
                    {/* Intent classification stage */}
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-foreground/90 font-medium">Classifying request intent</span>
                    </div>

                    {/* Retrieval search state */}
                    <div className="flex items-start gap-2">
                      {isSearching && (!message.sources || message.sources.length === 0) ? (
                        <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-1.5">
                        <span className="text-foreground/90 font-medium">Scanning private memory graph</span>
                        
                        {/* List processed sources dynamically */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="grid grid-cols-1 gap-1.5 pl-1.5 pt-1 border-l border-border">
                            {message.sources.map((src, i) => (
                              <motion.div
                                key={src.id}
                                initial={{ x: -4, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium"
                              >
                                <span className="w-1 h-1 rounded-full bg-emerald-500/60 animate-ping shrink-0" />
                                <span className="text-emerald-500/80">Reading:</span>
                                <span className="text-foreground/80 truncate max-w-[200px]">{src.label}</span>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Answer synthesis state */}
                    <div className="flex items-center gap-2">
                      {isSearching ? (
                        <span className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                      <span className={cn(
                        "font-medium",
                        isSearching ? "text-muted-foreground/60" : "text-foreground/90"
                      )}>
                        Synthesizing answer with source-backed citations
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Message body / Text */}
        {message.isTyping ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.2)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 animate-pulse [animation-delay:0.15s] shadow-[0_0_8px_rgba(16,185,129,0.2)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 animate-pulse [animation-delay:0.3s] shadow-[0_0_8px_rgba(16,185,129,0.2)]" />
          </div>
        ) : (
          <div className="relative text-sm text-foreground/95 select-text">
            <Markdown content={message.content} />
            
            {/* Blinking streaming cursor */}
            {isLast && isResponding && (
              <span className="inline-block w-[3px] h-[15px] bg-emerald-500 ml-0.5 align-middle animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
            )}
          </div>
        )}
      </Card>

      {/* Sources inside bubble (Inline tags for easy click-to-drawer) */}
      {!message.isTyping && hasSources && (
        <div className="px-1 flex flex-wrap items-center">
          {message.sources!.map((source) => (
            <SourceCitation key={source.id} source={source} />
          ))}
        </div>
      )}

      {/* Action suggestions inside the thread */}
      {!message.isTyping && message.suggestedActions && (
        <SuggestedActions actions={message.suggestedActions} />
      )}
    </motion.div>
  );
}
