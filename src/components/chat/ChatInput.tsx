"use client";

import { useRef, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUp, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop: () => void;
}

export function ChatInput({ 
  input, 
  handleInputChange, 
  handleSubmit, 
  isLoading, 
  stop 
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() || isLoading) {
        const form = e.currentTarget.form;
        if (form) form.requestSubmit();
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 md:pb-8">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end w-full gap-2 p-1.5 bg-muted/50 border border-border rounded-2xl focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all shadow-sm"
      >
        <TextareaAutosize
          ref={textareaRef}
          rows={1}
          maxRows={8}
          placeholder="Ask Debo about your life..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          className="flex-1 w-full p-3 bg-transparent border-none focus:ring-0 resize-none text-sm placeholder:text-muted-foreground/60 min-h-[44px] max-h-[200px]"
        />
        
        <div className="flex items-center gap-2 pr-1.5 pb-1.5">
          {isLoading ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={stop}
              className="w-8 h-8 rounded-xl text-primary hover:bg-primary/10 transition-colors"
            >
              <StopCircle className="w-5 h-5 fill-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!input.trim()}
              size="icon"
              className={cn(
                "w-8 h-8 rounded-xl transition-all duration-200",
                input.trim() 
                  ? "bg-primary text-primary-foreground shadow-md hover:scale-105 active:scale-95" 
                  : "bg-muted-foreground/20 text-muted-foreground cursor-not-allowed"
              )}
            >
              <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
            </Button>
          )}
        </div>
      </form>
      <p className="mt-2 text-[10px] text-center text-muted-foreground/50">
        Debo can search your journals and memories to provide personalized insights.
      </p>
    </div>
  );
}
