"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X, BookOpen, Clock, FileText } from "lucide-react";
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
  if (isNaN(d.getTime())) return "Draft";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getWordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
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
            e.content.toLowerCase().includes(q),
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
    <div className="flex h-full flex-col bg-zinc-950/45 backdrop-blur-md select-none border-zinc-800/10">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4.5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80">
            <BookOpen className="h-4 w-4 text-zinc-350" />
          </div>
          <h2 className="text-sm font-bold tracking-wider uppercase text-zinc-300 font-[var(--font-nunito)]">
            Journal
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            onClick={onNewEntry}
            size="sm"
            className="h-8 gap-1 px-3 text-[11px] font-bold rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black shadow-lg shadow-white/5 active:scale-[0.97] transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
          {onClose ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden rounded-xl border border-zinc-800/40 bg-zinc-900/30 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
              onClick={onClose}
              aria-label="Close list"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* Search Input */}
      <div className="px-4.5 pb-4">
        <div className="relative group">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
          <Input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9.5 pl-9.5 pr-8 text-xs rounded-xl border-zinc-900 bg-zinc-900/40 focus:bg-zinc-900/60 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-800 focus-visible:border-zinc-750 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-305 rounded-full p-0.5 hover:bg-zinc-800 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Entry Feed List */}
      <ScrollArea className="flex-1 px-2.5 pb-4">
        <div className="space-y-4 pr-1">
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-7 w-7 text-zinc-700 stroke-[1.5] mb-2" />
              <p className="text-[11px] text-zinc-500 font-medium max-w-[150px] leading-relaxed">
                {search ? "No matching entries found." : "Your journal is empty."}
              </p>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.label} className="space-y-1.5">
                <p className="px-2 pb-0.5 text-[9px] font-extrabold uppercase tracking-wider text-zinc-500/80">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.entries.map((entry) => {
                    const active = entry.id === activeEntryId;
                    const wordCount = getWordCount(entry.content);
                    const isTemp = entry.id.startsWith("temp_");

                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => onSelect(entry.id)}
                        disabled={isTemp}
                        className={cn(
                          "group relative w-full rounded-xl p-3 text-left transition-all duration-200 border text-zinc-300",
                          active
                            ? "bg-zinc-900/80 border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.5)] text-white hover:translate-x-0"
                            : "bg-transparent border-transparent hover:bg-zinc-900/30 hover:border-zinc-900/50 hover:translate-x-0.5 active:translate-x-0",
                          isTemp && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        {/* Left Active Glow Indicator */}
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-white rounded-r-full shadow-[0_0_8px_white]" />
                        )}

                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "truncate text-xs font-bold font-[var(--font-nunito)] tracking-tight leading-snug",
                              active ? "text-zinc-100" : "text-zinc-300 group-hover:text-zinc-200",
                              !entry.title && "text-zinc-550 italic font-normal",
                            )}
                          >
                            {entry.title || (isTemp ? "Drafting..." : "Untitled Note")}
                          </p>
                          
                          {/* Top-Right relative date indicator */}
                          <span className="shrink-0 text-[10px] text-zinc-550 group-hover:text-zinc-400 transition-colors font-medium">
                            {formatRelative(entry.updatedAt ?? entry.createdAt)}
                          </span>
                        </div>
                        
                        <p className={cn(
                          "mt-1.5 line-clamp-2 text-[11px] leading-relaxed transition-colors",
                          active ? "text-zinc-400" : "text-zinc-500 group-hover:text-zinc-400"
                        )}>
                          {entry.preview || (isTemp ? "Starting draft..." : "Write your thoughts...")}
                        </p>
                        
                        {/* Footer details (hover-revealed word count) */}
                        <div className="mt-2.5 flex items-center justify-between text-[9px] font-medium text-zinc-550 transition-colors">
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {Math.max(1, Math.ceil(wordCount / 200))} min
                          </span>
                          
                          <span className="flex items-center gap-1">
                            <FileText className="w-2.5 h-2.5" />
                            {wordCount} {wordCount === 1 ? "word" : "words"}
                          </span>
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
