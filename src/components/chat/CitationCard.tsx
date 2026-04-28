"use client";

import Link from "next/link";
import { BookOpenText, Brain, CalendarDays } from "lucide-react";

interface CitationCardProps {
  source: {
    id: string;
    sourceType?: "journal" | "memory";
    content: string;
    snippet?: string;
    date?: string | Date;
    title?: string | null;
    journalId?: string;
    source?: string;
  };
}

export function CitationCard({ source }: CitationCardProps) {
  const isJournal = source.sourceType !== "memory";
  const Icon = isJournal ? BookOpenText : Brain;
  const date = formatDate(source.date);
  const card = (
    <div className="group h-full rounded-lg border border-border/70 bg-background p-3 text-left shadow-sm transition hover:border-primary/35 hover:bg-primary/5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {isJournal ? source.title || "Journal entry" : "Memory"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {isJournal ? date || "Journal date" : `Source: ${source.source || "memory"}`}
            </p>
          </div>
        </div>
        {isJournal && date && (
          <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" />
        )}
      </div>
      <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">
        {source.snippet || source.content}
      </p>
    </div>
  );

  if (isJournal && source.journalId) {
    return <Link href={`/dashboard/journal/${source.journalId}`}>{card}</Link>;
  }

  return card;
}

function formatDate(value?: string | Date) {
  if (!value) return undefined;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
