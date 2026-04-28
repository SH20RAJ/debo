"use client";

import { useEffect, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUp, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (value: string) => void;
  isBusy: boolean;
  stop: () => Promise<void>;
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  isBusy,
  stop,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isBusy) {
      textareaRef.current?.focus();
    }
  }, [isBusy]);

  const submit = () => {
    if (isBusy) return;
    onSubmit(input);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="mx-auto flex max-w-5xl items-end gap-2 rounded-lg border border-border bg-muted/25 p-2 shadow-sm transition focus-within:border-primary/40 focus-within:bg-background"
    >
      <TextareaAutosize
        ref={textareaRef}
        minRows={1}
        maxRows={6}
        value={input}
        disabled={isBusy}
        placeholder="Ask about a memory, pattern, week, or decision..."
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        className="min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-sm leading-6 outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-60"
      />

      {isBusy ? (
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() => void stop()}
          className="size-10 shrink-0 rounded-lg"
          aria-label="Stop response"
        >
          <Square className="size-4 fill-current" />
        </Button>
      ) : (
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim()}
          className={cn(
            "size-10 shrink-0 rounded-lg transition",
            input.trim() && "shadow-sm hover:-translate-y-0.5"
          )}
          aria-label="Send message"
        >
          <ArrowUp className="size-4" />
        </Button>
      )}
    </form>
  );
}
