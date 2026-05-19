"use client";

import { useEffect, useState } from "react";
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
  };
}

export function LibraryPage() {
  const [activeType, setActiveType] = useState<SourceType | "all">("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [sources, setSources] = useState<MemorySource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchSources() {
      try {
        const data = await api.sources.list();
        const items = Array.isArray(data) ? data : data?.sources ?? data?.data ?? [];
        if (!cancelled) {
          setSources(items.map(normalizeSource));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }
    fetchSources();
    return () => { cancelled = true; };
  }, []);

  const filtered = sources.filter((s) => {
    const matchesType = activeType === "all" || s.type === activeType;
    const matchesSearch =
      search === "" ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.summary.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  }).sort((a, b) => {
    if (sortMode === "title") return a.title.localeCompare(b.title);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-foreground">Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your complete source archive
          </p>
        </div>
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
              <div key={i} className="rounded-xl border-2 border-border bg-card p-4 h-40 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-foreground">Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your complete source archive
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Could not load sources</p>
            <p className="text-xs text-muted-foreground mt-1">
              Make sure the API is running.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your complete source archive
        </p>
      </div>

      {/* Filter bar */}
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

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-medium text-foreground">No sources found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((source) => (
              <SourceCard key={source.id} source={source} variant="grid" />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((source) => (
              <SourceCard key={source.id} source={source} variant="list" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
