"use client";

import {
  BookOpen,
  Mic,
  FileText,
  Link as LinkIcon,
  Users,
  CheckSquare,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LibrarySource, SourceStatus, SourceType } from "./library-page";

interface SourceCardProps {
  source: LibrarySource;
  variant: "grid" | "list";
}

const TYPE_ICONS: Record<
  Exclude<SourceType, "all">,
  React.ComponentType<{ className?: string }>
> = {
  journal: BookOpen,
  voice: Mic,
  file: FileText,
  link: LinkIcon,
  meeting: Users,
  task: CheckSquare,
};

const TYPE_LABELS: Record<Exclude<SourceType, "all">, string> = {
  journal: "Journal",
  voice: "Voice",
  file: "File",
  link: "Link",
  meeting: "Meeting",
  task: "Task",
};

const STATUS_CONFIG: Record<
  SourceStatus,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  ready: {
    label: "Ready",
    color: "text-green-600 bg-green-500/10 border-green-500/20",
    icon: CheckSquare,
  },
  processing: {
    label: "Processing",
    color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    icon: Loader2,
  },
  needs_review: {
    label: "Needs review",
    color: "text-orange-600 bg-orange-500/10 border-orange-500/20",
    icon: AlertCircle,
  },
};

export function SourceCard({ source, variant }: SourceCardProps) {
  const TypeIcon = TYPE_ICONS[source.type];
  const statusCfg = STATUS_CONFIG[source.status];
  const StatusIcon = statusCfg.icon;

  if (variant === "list") {
    return (
      <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group">
        {/* Type icon */}
        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <TypeIcon className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              {source.title}
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full border",
                statusCfg.color
              )}
            >
              <StatusIcon
                className={cn(
                  "w-2.5 h-2.5",
                  source.status === "processing" && "animate-spin"
                )}
              />
              {statusCfg.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {source.summary}
          </p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 shrink-0">
          {source.people.length > 0 && (
            <div className="flex -space-x-1.5">
              {source.people.slice(0, 3).map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary border border-card text-[9px] font-bold text-muted-foreground"
                  title={p}
                >
                  {p[0]}
                </span>
              ))}
            </div>
          )}
          {source.taskCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <CheckSquare className="w-3 h-3" />
              {source.taskCount}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            {source.date}
          </span>
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div className="flex flex-col p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group">
      {/* Header row */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <TypeIcon className="w-4 h-4 text-muted-foreground" />
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full border",
            statusCfg.color
          )}
        >
          <StatusIcon
            className={cn(
              "w-2.5 h-2.5",
              source.status === "processing" && "animate-spin"
            )}
          />
          {statusCfg.label}
        </span>
      </div>

      {/* Title + summary */}
      <p className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
        {source.title}
      </p>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
        {source.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-border">
        <div className="flex items-center gap-2">
          {source.people.length > 0 && (
            <div className="flex -space-x-1">
              {source.people.slice(0, 3).map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary border border-card text-[9px] font-bold text-muted-foreground"
                  title={p}
                >
                  {p[0]}
                </span>
              ))}
            </div>
          )}
          {source.taskCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <CheckSquare className="w-3 h-3" />
              {source.taskCount}
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground">
          {source.date}
        </span>
      </div>
    </div>
  );
}
