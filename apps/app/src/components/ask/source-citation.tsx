"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mic,
  FileText,
  CheckSquare,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  BookOpen,
  Link2,
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

const SOURCE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  voice: Mic,
  task: CheckSquare,
  journal: BookOpen,
  file: FileText,
  email: FileText,
  calendar: Calendar,
  link: Link2,
};

const CONFIDENCE_CONFIG = {
  strong: {
    label: "Strong match",
    variant: "default" as const,
    dotClass: "bg-emerald-500",
    badgeClass:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  partial: {
    label: "Partial match",
    variant: "secondary" as const,
    dotClass: "bg-amber-500",
    badgeClass:
      "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  weak: {
    label: "Needs context",
    variant: "outline" as const,
    dotClass: "bg-muted-foreground/50",
    badgeClass: "text-muted-foreground",
  },
};

interface SourceCitationProps {
  source: SourceData;
  compact?: boolean;
}

export function SourceCitation({ source, compact = false }: SourceCitationProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = SOURCE_ICONS[source.type] || FileText;
  const confidence = CONFIDENCE_CONFIG[source.confidence];

  if (compact) {
    return (
      <Card className="flex items-center gap-2.5 px-3 py-2 border-border/60 bg-card/80 hover:bg-muted/40 transition-colors cursor-pointer">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted shrink-0">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            {source.label}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {source.detail}
          </p>
        </div>
        <span className={cn("w-2 h-2 rounded-full shrink-0", confidence.dotClass)} />
      </Card>
    );
  }

  return (
    <div className="group">
      <Button
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
        className="w-full justify-start gap-2 h-auto px-3 py-2 rounded-xl hover:bg-muted/50 text-left"
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-muted shrink-0">
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
      </Button>

      {/* Expanded details */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out",
          expanded ? "max-h-60 opacity-100 mt-1.5" : "max-h-0 opacity-0"
        )}
      >
        <div className="ml-2 pl-4 border-l-2 border-border space-y-2 pb-2">
          {/* Confidence badge */}
          <div className="flex items-center gap-1.5">
            <span
              className={cn("w-1.5 h-1.5 rounded-full", confidence.dotClass)}
            />
            <Badge variant={confidence.variant} className={cn("text-[11px] px-1.5 py-0", confidence.badgeClass)}>
              {confidence.label}
            </Badge>
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
                <Badge
                  key={task}
                  variant="outline"
                  className="text-[11px] gap-1 px-2 py-0 font-normal"
                >
                  <CheckSquare className="w-2.5 h-2.5" />
                  {task}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
