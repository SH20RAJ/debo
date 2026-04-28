"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { Sparkles } from "lucide-react";

interface ChatContainerProps {
  messages: any[];
  isLoading: boolean;
  onSuggestionClick?: (suggestion: string) => void;
}

export function ChatContainer({ messages, isLoading, onSuggestionClick }: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 ring-1 ring-primary/20">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">How can I help you today?</h1>
        <p className="text-muted-foreground text-center max-w-md text-sm leading-relaxed">
          Debo is your personal life companion. Ask about your memories, journal entries, or for reflection on your habits.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10 w-full max-w-xl">
          {[
            "What did I do last weekend?",
            "What are my common stress triggers?",
            "Summarize my month of April.",
            "Tell me a memory about my cat."
          ].map((suggestion) => (
            <button
              key={suggestion}
              className="p-4 text-left text-sm rounded-2xl border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/20 transition-all group"
              onClick={() => onSuggestionClick?.(suggestion)}
            >
              <p className="font-medium group-hover:text-primary transition-colors">{suggestion}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto pt-8 pb-32 px-4 md:px-0 scroll-smooth"
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start mb-6">
            <div className="bg-muted text-foreground rounded-2xl rounded-tl-none px-4 py-3 border border-border animate-pulse flex items-center gap-2">
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                 <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                 <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" />
               </div>
               <span className="text-xs font-medium text-muted-foreground/60">Debo is thinking...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
