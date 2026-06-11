"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { FilterBar, type ViewMode, type SortMode } from "@/components/library/filter-bar";
import { SourceCard } from "@/components/library/source-card";
import { api } from "@/lib/api";
import type { MemorySource, SourceType } from "@/lib/types";

function normalizeSource(raw: any): MemorySource {
  return {
    id: raw.id ?? crypto.randomUUID(),
    type: raw.type ?? "file",
    title: raw.title ?? "Untitled",
    summary: raw.summary ?? "",
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    status: raw.status ?? "ready",
    people: raw.people ?? [],
    projects: raw.projects ?? [],
    taskCount: raw.taskCount ?? raw.task_count ?? 0,
    sourceLabel: raw.sourceLabel ?? raw.source_label ?? "",
    plainText: raw.plainText ?? raw.plain_text ?? "",
  };
}

export function LibraryPage() {
  const [activeType, setActiveType] = useState<SourceType | "all">("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("date");

  const { data: rawSources = [], error, isLoading } = useSWR("/api/sources", () => api.sources.list());

  const sources = useMemo(() => {
    const items = Array.isArray(rawSources) ? rawSources : (rawSources as any)?.sources ?? (rawSources as any)?.data ?? [];
    return items.map(normalizeSource);
  }, [rawSources]);

  const filtered = useMemo(() => {
    return sources.filter((s: MemorySource) => {
      const matchesType = activeType === "all" || s.type === activeType;
      const matchesSearch =
        search === "" ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.summary.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    }).sort((a: MemorySource, b: MemorySource) => {
      if (sortMode === "title") return a.title.localeCompare(b.title);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [sources, activeType, search, sortMode]);

  const header = (
    <div className="px-6 pt-6 pb-3">
      <h1 className="text-2xl font-bold text-foreground font-[var(--font-nunito)]">
        Library
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Everything you&apos;ve captured, in one place.
      </p>
    </div>
  );

  // Only show loading skeletons if there's no data already cached
  if (isLoading && sources.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {header}
        <div className="px-6 pb-4">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            activeType={activeType}
            onTypeChange={setActiveType}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortMode={sortMode}
            onSortModeChange={setSortMode}
          />
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-2xl border-2 border-border bg-card p-4 h-36 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && sources.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {header}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="size-10 rounded-xl bg-accent flex items-center justify-center">
              <FileTextIcon />
            </div>
            <p className="text-xs text-muted-foreground max-w-[28ch]">
              Could not load sources. Make sure the API is running.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {header}
      <div className="px-6 pb-4">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          activeType={activeType}
          onTypeChange={setActiveType}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="size-10 rounded-xl bg-accent flex items-center justify-center">
              <FileTextIcon />
            </div>
            <p className="text-xs text-muted-foreground max-w-[28ch]">
              {search || activeType !== "all"
                ? "No sources match your filters."
                : "Capture a journal, voice note, or link to start your library."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((source: MemorySource) => (
              <SourceCard key={source.id} source={source} variant="grid" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((source: MemorySource) => (
              <SourceCard key={source.id} source={source} variant="list" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FileTextIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
