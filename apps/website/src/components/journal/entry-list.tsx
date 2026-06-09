"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X, Book } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { JournalEntry } from "./journal-page";

interface JournalEntryListProps {
  entries: JournalEntry[];
  activeEntryId: string;
  onSelect: (id: string) => void;
  onNewEntry: () => void;
  onClose?: () => void;
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
  const startOfWeek = new Date(startOfToday.getTime() - 7 * 86400000);

  if (date >= startOfToday) return "Today";
  if (date >= startOfYesterday) return "Yesterday";
  if (date >= startOfWeek) return "This week";
  return "Older";
}

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function JournalEntryList({
  entries,
  activeEntryId,
  onSelect,
  onNewEntry,
  onClose,
}: JournalEntryListProps) {
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? entries.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.preview.toLowerCase().includes(q),
        )
      : entries;

    const sorted = [...filtered].sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.updatedAt ?? a.createdAt).getTime(),
    );

    const map = new Map<string, JournalEntry[]>();
    for (const entry of sorted) {
      const key = getDateGroup(entry.updatedAt ?? entry.createdAt);
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
    const order = ["Today", "Yesterday", "This week", "Older"];
    return order
      .filter((k) => map.has(k))
      .map((k) => ({ label: k, entries: map.get(k)! }));
  }, [entries, search]);

  return (
    <div className="flex h-full flex-col bg-card/40 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <Book className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight text-foreground font-[var(--font-nunito)]">
            Journal
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={onNewEntry}
            size="sm"
            className="h-8 gap-1.5 px-3 text-xs rounded-xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
          {onClose ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden rounded-xl"
              onClick={onClose}
              aria-label="Close list"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* Search Input */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 pr-8 text-xs rounded-xl border-border/50 bg-muted/40 focus-visible:ring-primary/20 focus-visible:border-primary/50"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground rounded-full p-0.5 hover:bg-accent transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Entry Feed List */}
      <ScrollArea className="flex-1">
        <div className="px-2 pb-4 space-y-4">
          {grouped.length === 0 ? (
            <div className="px-3 py-12 text-center text-xs text-muted-foreground">
              {search ? "No matching entries" : "No entries yet"}
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="px-3 pb-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.entries.map((entry) => {
                    const active = entry.id === activeEntryId;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => onSelect(entry.id)}
                        className={cn(
                          "group relative w-full rounded-xl px-3 py-2.5 text-left transition-all border border-transparent",
                          active
                            ? "bg-primary/[0.07] border-primary/10 shadow-sm"
                            : "hover:bg-accent/40 hover:border-accent-foreground/5 text-foreground",
                        )}
                      >
                        {/* Active Left Indicator Bar */}
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-3/5 bg-primary rounded-r-full" />
                        )}

                        <p
                          className={cn(
                            "truncate text-xs font-semibold font-[var(--font-nunito)]",
                            active ? "text-primary" : "text-foreground",
                            !entry.title && "text-muted-foreground italic",
                          )}
                        >
                          {entry.title || "Untitled"}
                        </p>
                        
                        <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground/80 leading-normal">
                          {entry.preview || "No content..."}
                        </p>
                        
                        <div className="mt-2 flex items-center justify-between text-[9px] text-muted-foreground/60 font-medium">
                          <span>{formatRelative(entry.updatedAt ?? entry.createdAt)}</span>
                          {entry.content && (
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                              {entry.content.split(/\s+/).filter(Boolean).length} words
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
