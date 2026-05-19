"use client";

import { useState } from "react";
import { FilterBar, type ViewMode, type SortMode } from "@/components/library/filter-bar";
import { SourceCard } from "@/components/library/source-card";
import { MEMORIES } from "@/lib/mock";
import type { SourceType } from "@/lib/types";

export function LibraryPage() {
  const [activeType, setActiveType] = useState<SourceType | "all">("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("date");

  const filtered = MEMORIES.filter((s) => {
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
