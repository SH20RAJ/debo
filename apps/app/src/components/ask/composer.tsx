"use client";

import { useState } from "react";
import {
  Mic,
  Paperclip,
  SlidersHorizontal,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MODES = ["Recall", "Summarize", "Find tasks", "Compare", "Plan", "Draft"];

interface ComposerProps {
  onSend: (message: string) => void;
}

export function Composer({ onSend }: ComposerProps) {
  const [value, setValue] = useState("");
  const [activeMode, setActiveMode] = useState("Recall");

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card/80 backdrop-blur-xl">
      {/* Mode selector */}
      <div className="flex items-center gap-1.5 px-4 pt-3 pb-1 overflow-x-auto scrollbar-none">
        {MODES.map((mode) => (
          <button
            key={mode}
            onClick={() => setActiveMode(mode)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              activeMode === mode
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2 px-4 pb-4 pt-2">
        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          title="Attach source"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          title="Filter sources"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Debo about your memories..."
            rows={1}
            className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-2.5 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all max-h-32"
            style={{ minHeight: "42px" }}
          />
          <button
            onClick={handleSend}
            disabled={!value.trim()}
            className={cn(
              "absolute right-2 bottom-1.5 flex items-center justify-center w-7 h-7 rounded-xl transition-all",
              value.trim()
                ? "bg-primary text-primary-foreground shadow-sm hover:shadow-md"
                : "text-muted-foreground"
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          title="Voice input"
        >
          <Mic className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
