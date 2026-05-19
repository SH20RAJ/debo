"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Mic, BookOpen, FileText } from "lucide-react";

export interface MemoryCardProps {
  sourceType: "voice" | "journal" | "file";
  title: string;
  summary: string;
  date: string;
  people?: string[];
  taskCount?: number;
}

const sourceIcons: Record<MemoryCardProps["sourceType"], LucideIcon> = {
  voice: Mic,
  journal: BookOpen,
  file: FileText,
};

const sourceLabels: Record<MemoryCardProps["sourceType"], string> = {
  voice: "Voice note",
  journal: "Journal",
  file: "PDF",
};

export function MemoryCard({
  sourceType,
  title,
  summary,
  date,
  people,
  taskCount,
}: MemoryCardProps) {
  const Icon = sourceIcons[sourceType];
  const sourceLabel = sourceLabels[sourceType];

  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-border bg-card p-5",
        "transition-all duration-200 hover:border-primary/30 hover:shadow-sm",
        "flex flex-col gap-3"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
          <Icon className="w-4.5 h-4.5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">{sourceLabel}</p>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
        {summary}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-2 flex-wrap mt-auto pt-1">
        <span className="text-xs text-muted-foreground">{date}</span>
        {people && people.length > 0 && (
          <>
            <span className="text-muted-foreground/40 text-xs">·</span>
            {people.map((person) => (
              <span
                key={person}
                className="inline-flex items-center text-xs font-medium text-muted-foreground bg-accent px-2 py-0.5 rounded-full"
              >
                {person}
              </span>
            ))}
          </>
        )}
        {taskCount !== undefined && taskCount > 0 && (
          <>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <span className="inline-flex items-center text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {taskCount} {taskCount === 1 ? "task" : "tasks"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
