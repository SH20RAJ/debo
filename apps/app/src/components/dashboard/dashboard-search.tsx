"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";

import { searchJournals } from "@/actions/search";
import { cn } from "@/lib/utils";

type SearchResult = Awaited<ReturnType<typeof searchJournals>>[number];

export function DashboardSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const timeout = window.setTimeout(() => {
      startTransition(async () => {
        const nextResults = await searchJournals(trimmed, 6);
        setResults(nextResults);
        setOpen(true);
      });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [query]);

  const goToResult = (result: SearchResult) => {
    const id = result.journalId || result.id;
    if (!id) return;

    setOpen(false);
    setQuery("");
    router.push(`/dashboard/journal/text/${id}`);
  };

  return (
    <div className="relative hidden md:block">
      <div className="flex h-11 w-[320px] items-center gap-3 rounded-lg border border-border/30 bg-muted/20 px-3 transition-colors focus-within:border-primary/50 focus-within:bg-card">
        <Search className="h-4 w-4 text-muted-foreground/50" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search journals..."
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
        />
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground/50" />
        ) : (
          <kbd className="rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground/50">
            ⌘K
          </kbd>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div
          className={cn(
            "absolute right-0 top-[52px] z-50 w-[420px] overflow-hidden rounded-lg border border-border bg-popover shadow-xl",
            results.length === 0 && !isPending ? "p-4" : "p-2",
          )}
          onMouseDown={(event) => event.preventDefault()}
        >
          {results.length > 0 ? (
            <div className="space-y-1">
              {results.map((result, index) => (
                <button
                  key={`${result.id}-${index}`}
                  type="button"
                  onClick={() => goToResult(result)}
                  className="w-full rounded-md px-3 py-3 text-left transition-colors hover:bg-muted"
                >
                  <div className="truncate text-sm font-medium text-foreground">
                    {result.title || "Untitled journal"}
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {result.snippet}
                  </div>
                </button>
              ))}
            </div>
          ) : isPending ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No matching journals yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
