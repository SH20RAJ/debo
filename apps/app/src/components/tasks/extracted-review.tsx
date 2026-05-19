"use client";

import { useState } from "react";
import { Sparkles, Check, Pencil, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExtractedTask {
  id: string;
  title: string;
  sourceExcerpt: string;
  source: string;
  sourceType: "voice" | "journal" | "meeting";
  confidence: "strong" | "partial" | "weak";
}

const mockExtracted: ExtractedTask[] = [
  {
    id: "ext-1",
    title: "Send finalized Q4 budget to Raj",
    sourceExcerpt:
      '"...I promised Raj I\'ll send the finalized Q4 budget allocation by Friday before the board meeting..."',
    source: "Marketing Sync voice note",
    sourceType: "voice",
    confidence: "strong",
  },
  {
    id: "ext-2",
    title: "Follow up with Sarah about API integration",
    sourceExcerpt:
      '"...need to circle back with Sarah on the API integration timeline, she mentioned next sprint..."',
    source: "Customer Call",
    sourceType: "meeting",
    confidence: "partial",
  },
  {
    id: "ext-3",
    title: "Draft blog post on memory OS",
    sourceExcerpt:
      '"...should write a blog post explaining the memory OS concept, could be great for launch..."',
    source: "Weekly Review journal",
    sourceType: "journal",
    confidence: "partial",
  },
];

const confidenceColors: Record<string, { label: string; color: string; bg: string }> = {
  strong: {
    label: "Strong",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  partial: {
    label: "Partial",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  weak: {
    label: "Weak",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
};

function ExtractedItem({
  task,
  onDismiss,
}: {
  task: ExtractedTask;
  onDismiss: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const conf = confidenceColors[task.confidence];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/20">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{task.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{task.source}</p>
        </div>
        <span
          className={cn(
            "flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            conf.bg,
            conf.color
          )}
        >
          <Sparkles className="w-3 h-3" />
          {conf.label}
        </span>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors"
      >
        <ChevronDown
          className={cn("w-3 h-3 transition-transform", expanded && "rotate-180")}
        />
        Source excerpt
      </button>

      {expanded && (
        <p className="text-xs text-muted-foreground italic mt-2 pl-4 border-l-2 border-border">
          {task.sourceExcerpt}
        </p>
      )}

      <div className="flex items-center gap-2 mt-3">
        <button className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity">
          <Check className="w-3 h-3" />
          Accept
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors">
          <Pencil className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={() => onDismiss(task.id)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
        >
          <X className="w-3 h-3" />
          Dismiss
        </button>
      </div>
    </div>
  );
}

export function ExtractedReview() {
  const [tasks, setTasks] = useState(mockExtracted);

  function dismiss(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  if (tasks.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold">
          Debo found {tasks.length} possible task{tasks.length !== 1 ? "s" : ""}
        </h2>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <ExtractedItem key={task.id} task={task} onDismiss={dismiss} />
        ))}
      </div>
    </section>
  );
}
