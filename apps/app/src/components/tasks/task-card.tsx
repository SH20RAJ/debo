"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Calendar, User2, Link2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type TaskStatus = "todo" | "doing" | "done";
export type TaskConfidence = "strong" | "partial" | "weak";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate?: string;
  relatedPerson?: string;
  source: string;
  sourceType: "voice" | "journal" | "meeting" | "file";
  confidence: TaskConfidence;
}

const confidenceConfig: Record<
  TaskConfidence,
  { label: string; color: string; bg: string }
> = {
  strong: {
    label: "Strong match",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  partial: {
    label: "Partial match",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  weak: {
    label: "Weak match",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
};

const sourceIcons: Record<string, string> = {
  voice: "🎙",
  journal: "📓",
  meeting: "📋",
  file: "📄",
};

export function TaskCard({ task }: { task: Task }) {
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const conf = confidenceConfig[task.confidence];

  function cycleStatus() {
    setStatus((s) => (s === "todo" ? "doing" : s === "doing" ? "done" : "todo"));
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-2xl border bg-card p-4 transition-all duration-200",
        status === "done"
          ? "border-border/50 opacity-60"
          : "border-border hover:border-primary/30 hover:shadow-sm"
      )}
    >
      <button
        onClick={cycleStatus}
        className="mt-0.5 flex-shrink-0 transition-colors"
        aria-label={`Mark as ${status === "todo" ? "doing" : status === "doing" ? "done" : "todo"}`}
      >
        {status === "done" ? (
          <CheckCircle2 className="w-5 h-5 text-primary" />
        ) : status === "doing" ? (
          <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-semibold leading-snug",
            status === "done" && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          {task.dueDate && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {task.dueDate}
            </span>
          )}

          {task.relatedPerson && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <User2 className="w-3 h-3" />
              {task.relatedPerson}
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <span>{sourceIcons[task.sourceType]}</span>
            {task.source}
          </span>
        </div>
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
  );
}
