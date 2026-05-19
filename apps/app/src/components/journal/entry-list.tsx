"use client";

import { useState, useMemo } from "react";
import { Plus, Search, ArrowDownAZ, ArrowUpAZ } from "lucide-react";
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
}

type SortOrder = "newest" | "oldest";

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
  const startOfWeek = new Date(startOfToday.getTime() - 7 * 86400000);

  if (date >= startOfToday) return "Today";
  if (date >= startOfYesterday) return "Yesterday";
  if (date >= startOfWeek) return "This Week";
  return "Older";
}

export function JournalEntryList({
  entries,
  activeEntryId,
  onSelect,
  onNewEntry,
}: JournalEntryListProps) {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const filtered = useMemo(() => {
    let list = entries;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.preview.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      const da = new Date(a.createdAt ?? a.date).getTime();
      const db = new Date(b.createdAt ?? b.date).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

    return list;
  }, [entries, search, sortOrder]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: { label: string; entries: JournalEntry[] }[] = [];
    const map = new Map<string, JournalEntry[]>();

    for (const entry of filtered) {
      const key = getDateGroup(entry.createdAt ?? entry.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }

    // Maintain display order
    const order = ["Today", "Yesterday", "This Week", "Older"];
    for (const label of order) {
      const items = map.get(label);
      if (items?.length) groups.push({ label, entries: items });
    }

    return groups;
  }, [filtered]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Journal</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setSortOrder((s) => (s === "newest" ? "oldest" : "newest"))}
              title={sortOrder === "newest" ? "Newest first" : "Oldest first"}
            >
              {sortOrder === "newest" ? (
                <ArrowDownAZ className="w-3.5 h-3.5" />
              ) : (
                <ArrowUpAZ className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              onClick={onNewEntry}
              size="sm"
              className="gap-1.5 text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 py-1.5 text-xs h-auto"
          />
        </div>
      </div>

      {/* Entry list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {grouped.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              {search ? "No matching entries" : "No entries yet"}
            </p>
          ) : (
            grouped.map((group) => (
              <div key={group.label} className="mb-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.entries.map((entry) => (
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
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
