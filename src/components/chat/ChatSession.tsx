"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Brain, CalendarDays, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { LoadingStep } from "./LoadingStep";

const suggestions = [
  "What patterns showed up in my journals this month?",
  "What have I written about work stress recently?",
  "What did I seem excited about last week?",
  "Which memories mention my long-term goals?",
];

type ChatSessionProps = {
  chatId: string | null;
  title?: string;
  initialMessages: UIMessage[];
  onCreateChat: (title: string) => Promise<string>;
  onMessageCommitted?: (chatId: string | null) => Promise<void> | void;
};

export function ChatSession({
  chatId,
  title,
  initialMessages,
  onCreateChat,
  onMessageCommitted,
}: ChatSessionProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatIdRef = useRef<string | null>(chatId);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ chatId: chatIdRef.current || undefined }),
      }),
    []
  );

  const { messages, sendMessage, status, stop } = useChat({
    transport,
    messages: initialMessages,
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Debo could not finish that response.");
    },
    onFinish: async () => {
      await onMessageCommitted?.(chatIdRef.current);
    },
  });

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  const submitPrompt = async (value: string) => {
    const text = value.trim();
    if (!text || isBusy) return;

    setInput("");

    if (!chatIdRef.current) {
      const createdChatId = await onCreateChat(text);
      chatIdRef.current = createdChatId;
    }

    await sendMessage({ text });
  };

  return (
    <div className="flex h-full min-h-[560px] flex-col overflow-hidden bg-background">
      <header className="border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-none text-foreground">
                {title || "Ask Debo"}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Persistent chat memory, live retrieval, and agent actions
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <span className="size-2 rounded-full bg-primary" />
            {isBusy ? "Thinking" : "Ready"}
          </div>
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
        <div className="mx-auto flex min-h-full max-w-5xl flex-col px-4 py-6 md:px-6">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col justify-center py-10">
              <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="mb-5 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
                  <span className="h-px w-10 bg-border" />
                  Private memory engine
                </div>
                <h2 className="max-w-xl text-3xl font-semibold leading-tight text-foreground md:text-5xl">
                  Search your life with a little more signal.
                </h2>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => submitPrompt(suggestion)}
                    className="group min-h-24 rounded-lg border border-border/70 bg-muted/20 p-4 text-left text-sm transition duration-200 hover:border-primary/35 hover:bg-primary/5"
                  >
                    <span className="line-clamp-2 font-medium leading-relaxed text-foreground transition group-hover:text-primary">
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5 pb-6">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {status === "submitted" && (
                <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <LoadingStep icon={Search} label="Searching journals..." />
                    <LoadingStep icon={Brain} label="Accessing memories..." />
                    <LoadingStep icon={CalendarDays} label="Updating chat memory..." />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border/60 bg-background/90 px-4 py-3 backdrop-blur md:px-6">
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={submitPrompt}
          isBusy={isBusy}
          stop={stop}
        />
      </footer>
    </div>
  );
}