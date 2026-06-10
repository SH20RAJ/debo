"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Mic, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const hasText = value.trim().length > 0;

  return (
    <div className="border-t border-white/5 bg-[#090d08]/80 backdrop-blur-xl px-4 pb-5 pt-3 relative select-none">
      {/* Mode selector accordion with framer-motion */}
      <AnimatePresence>
        {showModes && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: 5 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-1.5 pt-1 pb-3 overflow-x-auto scrollbar-none">
              {MODES.map((mode) => (
                <Badge
                  key={mode}
                  variant={activeMode === mode ? "default" : "secondary"}
                  onClick={() => setActiveMode(mode)}
                  className={cn(
                    "cursor-pointer px-3.5 py-1 text-xs font-bold transition-all duration-200 select-none rounded-lg border",
                    activeMode === mode
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_2px_0_#388E02] hover:bg-emerald-600"
                      : "bg-[#131911]/30 text-muted-foreground border-white/5 hover:text-foreground hover:bg-[#131911]/60"
                  )}
                >
                  {mode}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <div className="flex items-center gap-3">
        {/* Toggle Mode Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowModes((s) => !s)}
          className={cn(
            "shrink-0 rounded-xl text-xs font-bold h-10 px-3 border transition-all duration-200 cursor-pointer",
            showModes 
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]" 
              : "text-muted-foreground bg-[#131911]/30 border-white/5 hover:text-foreground hover:bg-[#131911]/50"
          )}
          title="Toggle search mode"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-500/80" />
          {activeMode}
        </Button>

        {/* Floating pill input */}
        <div className={cn(
          "flex-1 flex items-center relative rounded-2xl border bg-[#11170f]/50 transition-all duration-200 px-3 py-1",
          hasText 
            ? "border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)] focus-within:border-emerald-500/35 focus-within:shadow-[0_0_18px_rgba(16,185,129,0.08)]"
            : "border-white/5 focus-within:border-emerald-500/25 focus-within:shadow-[0_0_15px_rgba(16,185,129,0.06)]"
        )}>
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask Debo to ${activeMode.toLowerCase()}...`}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent pr-10 pl-1 h-10 text-sm placeholder:text-muted-foreground/60 text-foreground/90 font-medium"
          />
          
          {/* Send Button */}
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!hasText || isResponding}
            className={cn(
              "absolute right-1.5 w-8 h-8 rounded-xl transition-all duration-200 cursor-pointer",
              hasText
                ? "bg-emerald-500 text-white shadow-[0_2px_0_#388E02] hover:bg-emerald-600 scale-100 hover:scale-105 active:scale-95"
                : "bg-transparent text-muted-foreground/40 hover:bg-transparent"
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Voice Note Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/voice")}
          className="shrink-0 w-10 h-10 rounded-xl bg-[#131911]/30 border border-white/5 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5 hover:border-emerald-500/15 transition-all duration-200 cursor-pointer group"
          title="Open voice note recorder"
        >
          <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
