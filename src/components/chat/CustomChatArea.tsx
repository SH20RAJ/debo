"use client";

import { useState, useRef, useEffect } from "react";
import { useCopilotChat } from "@copilotkit/react-core";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function CustomChatArea() {
  const { visibleMessages, appendMessage, isLoading } = useCopilotChat();
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [visibleMessages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending || isLoading) return;

    const messageContent = inputValue;
    setInputValue("");
    setIsSending(true);

    try {
      await appendMessage(
        new TextMessage({
          content: messageContent,
          role: MessageRole.User,
        })
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      setInputValue(messageContent); // restore input on failure
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <ScrollArea className="flex-1 p-4 md:p-6">
        <div className="space-y-6 pb-4">
          {visibleMessages.length === 0 ? (
            <div className="flex h-[400px] flex-col items-center justify-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                <span className="text-2xl text-primary">✨</span>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground">Debo Intelligence</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Ask me anything about your past journals, patterns, or insights.
              </p>
            </div>
          ) : (
            visibleMessages.map((message) => {
              if (message.isActionExecutionMessage()) {
               return null;
              }

              if (message.isTextMessage()) {
                const isUser = message.role === MessageRole.User;
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-full overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300",
                      isUser ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "relative max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm",
                        isUser
                          ? "bg-primary text-primary-foreground font-medium rounded-br-sm"
                          : "bg-muted/50 border border-border/50 text-foreground rounded-bl-sm"
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })
          )}

          {isLoading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-bl-sm px-5 py-3.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-4xl items-end gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={isSending || isLoading}
            className="min-h-[52px] max-h-[160px] resize-none rounded-xl border-muted-foreground/20 bg-muted/50 py-3.5 pr-12 focus-visible:ring-1 focus-visible:ring-primary/30"
            rows={1}
          />
          <Button
            onClick={() => void handleSendMessage()}
            disabled={!inputValue.trim() || isSending || isLoading}
            size="icon"
            className="mb-0.5 size-[48px] shrink-0 rounded-xl"
          >
            {isSending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Send className="size-5" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <p className="mx-auto mt-2 max-w-4xl text-center text-[11px] font-medium text-muted-foreground/60">
          Debo Intelligence can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
}
