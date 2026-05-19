"use client";

import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JournalEntry } from "./journal-page";

interface JournalEntryListProps {
  entries: JournalEntry[];
  activeEntryId: string;
  onSelect: (id: string) => void;
  onNewEntry: () => void;
}

export function JournalEntryList({
  entries,
  activeEntryId,
  onSelect,
  onNewEntry,
}: JournalEntryListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Journal</h2>
          <button
            onClick={onNewEntry}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search entries..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary rounded-lg border border-border outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Entry list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelect(entry.id)}
            className={cn(
              "w-full text-left p-2.5 rounded-lg transition-colors",
              entry.id === activeEntryId
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-secondary border border-transparent"
            )}
          >
            <p
              className={cn(
                "text-sm font-medium truncate",
                entry.id === activeEntryId
                  ? "text-primary"
                  : "text-foreground"
              )}
            >
              {entry.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {entry.preview}
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">
              {entry.date}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
