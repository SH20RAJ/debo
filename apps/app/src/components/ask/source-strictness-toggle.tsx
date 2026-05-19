"use client";

import { Database, Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type StrictnessMode = "memory" | "reasoning" | "brainstorm";

const modes = [
  {
    id: "memory" as const,
    label: "Memory only",
    desc: "Answer only from your saved memories",
    icon: Database,
  },
  {
    id: "reasoning" as const,
    label: "Memory + reasoning",
    desc: "Use memories and general knowledge",
    icon: Brain,
  },
  {
    id: "brainstorm" as const,
    label: "Brainstorm",
    desc: "Creative mode, no source required",
    icon: Sparkles,
  },
];

export function SourceStrictnessToggle({
  value,
  onChange,
}: {
  value: StrictnessMode;
  onChange: (v: StrictnessMode) => void;
}) {
  return (
    <div className="flex gap-2">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border",
            value === m.id
              ? "bg-primary/10 text-primary border-primary/30 shadow-[0_2px_0_var(--border)]"
              : "text-muted-foreground border-border hover:bg-accent"
          )}
        >
          <m.icon className="w-3.5 h-3.5" />
          {m.label}
        </button>
      ))}
    </div>
  );
}
