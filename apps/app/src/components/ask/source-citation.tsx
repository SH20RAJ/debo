"use client";

import { useState } from "react";
import {
  Mic,
  FileText,
  CheckSquare,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SourceData {
  id: string;
  type: "voice" | "task" | "journal" | "file" | "email" | "calendar" | "link";
  label: string;
  detail: string;
  confidence: "strong" | "partial" | "weak";
  excerpt?: string;
  timestamp?: string;
  people?: string[];
  relatedTasks?: string[];
}

const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  voice: Mic,
  task: CheckSquare,
  journal: FileText,
  file: FileText,
  email: FileText,
  calendar: Calendar,
  link: ExternalLink,
};

const CONFIDENCE_CONFIG = {
  strong: {
    label: "Strong source match",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  partial: {
    label: "Partial source match",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  weak: {
    label: "Needs more context",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
};

interface SourceCitationProps {
  source: SourceData;
}

export function SourceCitation({ source }: SourceCitationProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = SOURCE_ICONS[source.type] || FileText;
  const confidence = CONFIDENCE_CONFIG[source.confidence];

  return (
    <div className="group">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-background shrink-0">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <span className="text-xs font-medium text-foreground/80 truncate flex-1">
          {source.label}
        </span>
        <span className="text-[11px] text-muted-foreground shrink-0">
          {source.detail}
        </span>
        {expanded ? (
          <ChevronUp className="w-3 h-3 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Expanded details */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out",
          expanded ? "max-h-60 opacity-100 mt-1.5" : "max-h-0 opacity-0"
        )}
      >
        <div className="ml-2 pl-4 border-l-2 border-border space-y-2 pb-2">
          {/* Confidence */}
          <div className="flex items-center gap-1.5">
            <span className={cn("w-1.5 h-1.5 rounded-full", confidence.dot)} />
            <span className={cn("text-[11px] font-medium", confidence.className)}>
              {confidence.label}
            </span>
          </div>

          {source.excerpt && (
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              &ldquo;{source.excerpt}&rdquo;
            </p>
          )}

          <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            {source.timestamp && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {source.timestamp}
              </span>
            )}
            {source.people && source.people.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {source.people.join(", ")}
              </span>
            )}
          </div>

          {source.relatedTasks && source.relatedTasks.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {source.relatedTasks.map((task) => (
                <span
                  key={task}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background text-[11px] text-muted-foreground border border-border"
                >
                  <CheckSquare className="w-2.5 h-2.5" />
                  {task}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
