"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Mic, Send } from "lucide-react";

const MODES = ["Recall", "Summarize", "Find tasks", "Compare", "Plan", "Draft"];

interface ComposerProps {
  onSend: (message: string, mode: string) => void;
  isResponding?: boolean;
}

export function Composer({ onSend, isResponding }: ComposerProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [activeMode, setActiveMode] = useState("Recall");
  const [showModes, setShowModes] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!value.trim() || isResponding) return;
    onSend(value.trim(), activeMode);
    setValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card/80 backdrop-blur-xl">
      {/* Mode selector — collapsed by default so chat feels like chat */}
      {showModes && (
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-1 overflow-x-auto scrollbar-none">
          {MODES.map((mode) => (
            <Badge
              key={mode}
              variant={activeMode === mode ? "default" : "secondary"}
              onClick={() => setActiveMode(mode)}
              className={cn(
                "cursor-pointer px-3 py-1 text-xs font-semibold transition-all select-none",
                activeMode === mode
                  ? "bg-primary text-primary-foreground shadow-[0_2px_0_#46A302] hover:bg-primary/90"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              {mode}
            </Badge>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 px-4 pb-4 pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowModes((s) => !s)}
          className={cn(
            "shrink-0 rounded-xl text-xs font-medium h-9 px-3",
            showModes ? "text-foreground bg-accent/60" : "text-muted-foreground"
          )}
          title="Answer mode"
        >
          {activeMode}
        </Button>

        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Debo — say hi or ask about your past..."
            className="duo-input pr-12 h-11 rounded-2xl"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!value.trim() || isResponding}
            className={cn(
              "absolute right-1.5 bottom-1.5 w-8 h-8 rounded-xl transition-all",
              value.trim()
                ? "bg-primary text-primary-foreground shadow-[0_2px_0_#46A302] hover:brightness-105"
                : "bg-transparent text-muted-foreground hover:bg-transparent"
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/voice")}
          className="shrink-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60"
          title="Voice note"
        >
          <Mic className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

