"use client";

import { Search, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SourceType } from "@/lib/types";

export type ViewMode = "grid" | "list";
export type SortMode = "date" | "title";

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  activeType: SourceType | "all";
  onTypeChange: (t: SourceType | "all") => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  sortMode: SortMode;
  onSortModeChange: (s: SortMode) => void;
}

const TYPE_TABS: { value: SourceType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "journal", label: "Journal" },
  { value: "voice", label: "Voice" },
  { value: "file", label: "Files" },
  { value: "link", label: "Links" },
  { value: "meeting", label: "Meetings" },
  { value: "task", label: "Tasks" },
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
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search sources..."
            className="pl-9"
          />
        </div>

        <Select value={sortMode} onValueChange={(v) => onSortModeChange(v as SortMode)}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort by date</SelectItem>
            <SelectItem value="title">Sort by title</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center border rounded-md overflow-hidden">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            className="size-8 rounded-none"
            onClick={() => onViewModeChange("grid")}
          >
            <LayoutGrid className="size-3.5" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            className="size-8 rounded-none"
            onClick={() => onViewModeChange("list")}
          >
            <List className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Type tabs */}
      <Tabs
        value={activeType}
        onValueChange={(v) => onTypeChange(v as SourceType | "all")}
      >
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          {TYPE_TABS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
