"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedContent, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };

    const allMessages = [...messages, userMessage];

    setMessages(allMessages);
    setInput("");
    setIsLoading(true);
    setStreamedContent("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              // Handle different message types from the stream
              if (parsed.type === "text-delta") {
                assistantContent += parsed.text || "";
                setStreamedContent(assistantContent);
              } else if (parsed.content) {
                assistantContent += typeof parsed.content === "string" ? parsed.content : "";
                setStreamedContent(assistantContent);
              }
            } catch {
              // Not JSON, might be plain text
              if (data.trim()) {
                assistantContent += data;
                setStreamedContent(assistantContent);
              }
            }
          }
        }
      }

      // Add final message
      if (assistantContent) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: assistantContent,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamedContent("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const suggestions = [
    "What do you remember about me?",
    "Show me my journal from this week",
    "What patterns do you see in my life?",
    "Help me write a journal entry",
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Minimal Sidebar */}
      <aside className="w-16 lg:w-64 border-r border-duo-swan/30 flex flex-col bg-card/50">
        <div className="p-3 border-b border-duo-swan/20">
          <Link href="/dashboard/journal/new">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-10 rounded-xl border-duo-swan/30">
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">New Entry</span>
            </Button>
          </Link>
        </div>
        <div className="flex-1 p-2 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 px-2 py-2 hidden lg:block">
            Recent
          </div>
        </div>
        <div className="p-3 border-t border-duo-swan/20">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-10 rounded-xl">
              <Sparkles className="h-4 w-4 text-duo-feather" />
              <span className="hidden lg:inline">Dashboard</span>
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b border-duo-swan/20 flex items-center justify-between px-4 bg-card/30">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-duo-feather animate-pulse" />
            <span className="text-sm font-medium text-foreground">Debo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Memory Active</span>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 && !streamedContent ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="h-12 w-12 rounded-xl bg-duo-feather/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-duo-feather" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">What would you like to explore?</h2>
                <p className="text-sm text-muted-foreground/70">Ask about your memories, journals, or life patterns.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="text-xs font-medium px-3 py-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-lg bg-duo-feather/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-duo-feather" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-duo-feather text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-lg bg-duo-macaw/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-duo-macaw" />
                    </div>
                  )}
                </div>
              ))}
              {streamedContent && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-lg bg-duo-feather/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-duo-feather" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{streamedContent}</p>
                    <span className="inline-block h-4 w-4 border-2 border-duo-feather/30 border-t-duo-feather rounded-full animate-spin ml-1" />
                  </div>
                </div>
              )}
            </>
          )}
          {isLoading && !streamedContent && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-duo-feather/10 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-duo-feather animate-spin" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-duo-swan/20 bg-card/30">
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              placeholder="Ask Debo anything..."
              className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-duo-feather/30 resize-none min-h-[48px]"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="h-12 w-12 rounded-xl bg-duo-feather hover:bg-duo-feather/90 shadow-md shadow-duo-feather-shadow/20 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-[10px] text-center text-muted-foreground/40 mt-2">
            Debo uses your journal data to answer. Your data stays private.
          </p>
        </div>
      </main>
    </div>
  );
}