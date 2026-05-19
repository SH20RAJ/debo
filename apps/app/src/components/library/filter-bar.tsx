"use client";

import {
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  BookOpen,
  Mic,
  FileText,
  Link as LinkIcon,
  Users,
  CheckSquare,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SourceType } from "./library-page";

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  activeType: SourceType;
  onTypeChange: (t: SourceType) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (v: "grid" | "list") => void;
  sortMode: "date" | "title";
  onSortModeChange: (s: "date" | "title") => void;
}

const TYPE_TABS: { value: SourceType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "all", label: "All", icon: Layers },
  { value: "journal", label: "Journal", icon: BookOpen },
  { value: "voice", label: "Voice", icon: Mic },
  { value: "file", label: "Files", icon: FileText },
  { value: "link", label: "Links", icon: LinkIcon },
  { value: "meeting", label: "Meetings", icon: Users },
  { value: "task", label: "Tasks", icon: CheckSquare },
];

export function FilterBar({
  search,
  onSearchChange,
  activeType,
  onTypeChange,
  viewMode,
  onViewModeChange,
  sortMode,
  onSortModeChange,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Search + controls row */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search sources..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-secondary rounded-xl border border-border outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortMode}
            onChange={(e) => onSortModeChange(e.target.value as "date" | "title")}
            className="appearance-none pl-3 pr-8 py-2 text-xs font-medium bg-secondary rounded-xl border border-border outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          >
            <option value="date">Sort by date</option>
            <option value="title">Sort by title</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-secondary rounded-xl border border-border overflow-hidden">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "p-2 transition-colors",
              viewMode === "grid"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "p-2 transition-colors",
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="List view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Type tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
        {TYPE_TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => onTypeChange(value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors",
              activeType === value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
