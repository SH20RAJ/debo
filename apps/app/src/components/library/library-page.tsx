"use client";

import { useState } from "react";
import { FilterBar } from "@/components/library/filter-bar";
import { SourceCard } from "@/components/library/source-card";

export type SourceType =
  | "all"
  | "journal"
  | "voice"
  | "file"
  | "link"
  | "meeting"
  | "task";

export type SourceStatus = "ready" | "processing" | "needs_review";

export interface LibrarySource {
  id: string;
  type: Exclude<SourceType, "all">;
  title: string;
  summary: string;
  date: string;
  people: string[];
  taskCount: number;
  status: SourceStatus;
}

const MOCK_SOURCES: LibrarySource[] = [
  {
    id: "1",
    type: "journal",
    title: "Product Ideas",
    summary:
      "Three features that could differentiate us from competitors: voice-first capture, source-backed answers, and private memory graph.",
    date: "May 18, 2026",
    people: ["Shaswat"],
    taskCount: 1,
    status: "ready",
  },
  {
    id: "2",
    type: "voice",
    title: "Marketing Sync Follow-up",
    summary:
      "You discussed Q4 allocation and promised Raj a finalized draft by Friday before the board meeting.",
    date: "May 17, 2026",
    people: ["Raj"],
    taskCount: 2,
    status: "ready",
  },
  {
    id: "3",
    type: "file",
    title: "Q4 Allocation Draft",
    summary:
      "Budget allocation document with department-level breakdowns and projected spend for Q4.",
    date: "May 16, 2026",
    people: ["Raj", "Sarah"],
    taskCount: 0,
    status: "needs_review",
  },
  {
    id: "4",
    type: "meeting",
    title: "Sprint Planning - Week 20",
    summary:
      "Discussed sprint goals, assigned tasks, and identified blockers for the current sprint.",
    date: "May 15, 2026",
    people: ["Sarah", "Alex"],
    taskCount: 5,
    status: "ready",
  },
  {
    id: "5",
    type: "link",
    title: "Reflect App - Editor Deep Dive",
    summary:
      "Analysis of how Reflect implements their block-based editor with AI features and backlinking.",
    date: "May 15, 2026",
    people: [],
    taskCount: 0,
    status: "ready",
  },
  {
    id: "6",
    type: "journal",
    title: "Weekly Review",
    summary:
      "This week was productive. Shipped the library page and started on the journal editor.",
    date: "May 14, 2026",
    people: [],
    taskCount: 2,
    status: "ready",
  },
  {
    id: "7",
    type: "voice",
    title: "Customer Call - Acme Corp",
    summary:
      "Discussed enterprise pricing, SSO requirements, and timeline for pilot program.",
    date: "May 13, 2026",
    people: ["John", "Lisa"],
    taskCount: 3,
    status: "processing",
  },
  {
    id: "8",
    type: "task",
    title: "Ship journal by end of May",
    summary:
      "High-priority task from Sarah meeting. Journal editor and insight rail need to be production-ready.",
    date: "May 12, 2026",
    people: ["Sarah"],
    taskCount: 0,
    status: "ready",
  },
  {
    id: "9",
    type: "file",
    title: "Competitive Analysis 2026",
    summary:
      "Detailed comparison of Debo vs Notion, Reflect, Mem, and Obsidian across 12 dimensions.",
    date: "May 10, 2026",
    people: [],
    taskCount: 0,
    status: "ready",
  },
];

type ViewMode = "grid" | "list";
type SortMode = "date" | "title";

export function LibraryPage() {
  const [activeType, setActiveType] = useState<SourceType>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("date");

  const filtered = MOCK_SOURCES.filter((s) => {
    const matchesType = activeType === "all" || s.type === activeType;
    const matchesSearch =
      search === "" ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.summary.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  }).sort((a, b) => {
    if (sortMode === "title") return a.title.localeCompare(b.title);
    return 0; // Keep original date order
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
            <p className="text-sm font-medium text-foreground">
              No sources found
            </p>
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
