"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
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
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Journal
        </h2>
        <div className="flex items-center gap-1">
          <Button
            onClick={onNewEntry}
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
          {onClose ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:hidden"
              onClick={onClose}
              aria-label="Close list"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search entries"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 pb-4">
          {grouped.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground">
              {search ? "No matching entries" : "No entries yet"}
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="px-3 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                <div className="space-y-px">
                  {group.entries.map((entry) => {
                    const active = entry.id === activeEntryId;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => onSelect(entry.id)}
                        className={cn(
                          "w-full rounded-md px-3 py-2 text-left transition-colors",
                          active
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50 text-foreground",
                        )}
                      >
                        <p
                          className={cn(
                            "truncate text-sm font-medium",
                            !entry.title && "text-muted-foreground italic",
                          )}
                        >
                          {entry.title || "Untitled"}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {entry.preview || "Empty entry"}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground/70">
                          {formatRelative(entry.updatedAt ?? entry.createdAt)}
                        </p>
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
