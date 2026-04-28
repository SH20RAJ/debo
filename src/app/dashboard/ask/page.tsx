"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-expect-error
import { useChat } from "ai/react";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatInput } from "@/components/chat/ChatInput";
import { toast } from "sonner";
import { askQuestionAction } from "@/actions/ask";
import { useEffect } from "react";

export default function AskPage() {
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading, 
    stop,
    error,
    append
  } = useChat({
    api: "/api/chat", // Fallback to API route for better streaming support in some envs
    onResponse: (response: any) => {
      if (!response.ok) {
        toast.error("Failed to get a response from Debo.");
      }
    },
    onError: (err: any) => {
      console.error("Chat error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  });

  // Example of how to handle suggestions
  const handleSuggestion = (suggestion: string) => {
    append({
      role: 'user',
      content: suggestion
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h2 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground">Live Memory Engine</h2>
        </div>
      </div>

      {/* Chat Area */}
      <ChatContainer 
        messages={messages} 
        isLoading={isLoading} 
        onSuggestionClick={handleSuggestion}
      />

      {/* Input Area */}
      <div className="bg-gradient-to-t from-background via-background to-transparent pt-12">
        <ChatInput 
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
        />
      </div>
    </div>
  );
}
