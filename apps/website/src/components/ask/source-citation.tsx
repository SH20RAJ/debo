"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import {
  Mic,
  FileText,
  CheckSquare,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Link2,
  Sparkles,
  Layers,
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
    percent: 92,
    gradient: "from-emerald-500 to-teal-500",
    dotClass: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    cardBorder: "hover:border-primary/30 hover:shadow-[0_0_12px_rgba(16,185,129,0.08)]",
    badgeClass: "bg-primary/10 text-primary border-emerald-500/20",
  },
  partial: {
    label: "Partial match",
    percent: 64,
    gradient: "from-amber-500 to-orange-500",
    dotClass: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    cardBorder: "hover:border-amber-500/30 hover:shadow-[0_0_12px_rgba(245,158,11,0.08)]",
    badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  weak: {
    label: "Weak match",
    percent: 32,
    gradient: "from-zinc-500 to-slate-500",
    dotClass: "bg-zinc-400",
    cardBorder: "hover:border-zinc-500/25",
    badgeClass: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
};

interface SourceCitationProps {
  source: SourceData;
  compact?: boolean;
}

export function SourceCitation({ source, compact = false }: SourceCitationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = SOURCE_ICONS[source.type] || FileText;
  const confidence = CONFIDENCE_CONFIG[source.confidence || "partial"];

  const handleOpenDrawer = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
  };

  // Compact layout (for the right sidebar rail)
  if (compact) {
    return (
      <>
        <Card
          onClick={handleOpenDrawer}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 border border-border bg-muted/30 hover:bg-muted/60 transition-all duration-200 cursor-pointer select-none rounded-xl",
            confidence.cardBorder
          )}
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/5 border border-primary/10 shrink-0">
            <Icon className="w-3.5 h-3.5 text-primary/80" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground/90 truncate leading-snug">
              {source.label}
            </p>
            <p className="text-[10px] text-muted-foreground truncate leading-normal">
              {source.detail}
            </p>
          </div>
          <span className={cn("w-2 h-2 rounded-full shrink-0", confidence.dotClass)} />
        </Card>

        <CitationDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} source={source} Icon={Icon} />
      </>
    );
  }

  // Standard Inline Layout (inside the chat bubble area)
  return (
    <>
      <button
        onClick={handleOpenDrawer}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/70 text-left transition-all duration-150 cursor-pointer select-none text-xs font-medium mr-1.5 mb-1.5 group",
          confidence.cardBorder
        )}
      >
        <Icon className="w-3.5 h-3.5 text-primary/70 group-hover:text-primary transition-colors" />
        <span className="text-foreground/85 group-hover:text-foreground truncate max-w-[120px] transition-colors">
          {source.label}
        </span>
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", confidence.dotClass)} />
      </button>

      <CitationDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} source={source} Icon={Icon} />
    </>
  );
}

interface CitationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  source: SourceData;
  Icon: React.ComponentType<{ className?: string }>;
}

function CitationDrawer({ isOpen, onClose, source, Icon }: CitationDrawerProps) {
  const confidence = CONFIDENCE_CONFIG[source.confidence || "partial"];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={source.label}
      description={source.detail}
    >
      <div className="space-y-6 pb-6">
        {/* Source Type & Confidence Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/10 border border-border rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Source Type</p>
              <p className="text-xs font-bold capitalize text-foreground/90 mt-0.5">{source.type}</p>
            </div>
          </div>

          <div className="bg-muted/10 border border-border rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Match Score</p>
              <Badge variant="outline" className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", confidence.badgeClass)}>
                {confidence.label}
              </Badge>
            </div>
            <div className="mt-2.5">
              <div className="w-full h-1.5 rounded-full bg-muted/10 overflow-hidden">
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r", confidence.gradient)}
                  style={{ width: `${confidence.percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Excerpt Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-foreground/80 tracking-wide flex items-center gap-1.5 select-none">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Matching Excerpt
          </h4>
          {source.excerpt ? (
            <div className="relative border border-primary/10 bg-muted/10 rounded-xl px-4 py-3 text-xs leading-relaxed text-foreground/90 italic">
              <span className="absolute -top-3.5 left-2 text-3xl font-serif text-primary/15 leading-none select-none">“</span>
              <p className="relative z-10">{source.excerpt}</p>
            </div>
          ) : (
            <div className="border border-border bg-muted/5 rounded-xl px-4 py-3 text-xs leading-relaxed text-muted-foreground/80 italic text-center">
              No direct quotation extracted. Matching determined via overall document vector context.
            </div>
          )}
        </div>

        {/* Metadata Details */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-foreground/80 tracking-wide flex items-center gap-1.5 select-none">
            <Layers className="w-3.5 h-3.5 text-primary" />
            Memory Details
          </h4>
          <div className="border border-border bg-muted/10 rounded-xl divide-y divide-border">
            {source.timestamp && (
              <div className="flex items-center justify-between px-3.5 py-3 text-xs">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-primary/60" />
                  Captured At
                </span>
                <span className="font-medium text-foreground/95">{source.timestamp}</span>
              </div>
            )}
            
            {source.people && source.people.length > 0 && (
              <div className="flex items-start justify-between px-3.5 py-3 text-xs gap-4">
                <span className="text-muted-foreground flex items-center gap-2 shrink-0 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-primary/60" />
                  People Tagged
                </span>
                <span className="font-medium text-foreground/95 text-right flex flex-wrap gap-1 justify-end">
                  {source.people.map(person => (
                    <Badge key={person} variant="secondary" className="text-[10px] px-2 py-0 bg-muted/10 border border-border text-foreground/90">
                      {person}
                    </Badge>
                  ))}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between px-3.5 py-3 text-xs">
              <span className="text-muted-foreground flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary/60" />
                Capture ID
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">{source.id}</span>
            </div>
          </div>
        </div>

        {/* Related Tasks */}
        {source.relatedTasks && source.relatedTasks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground/80 tracking-wide flex items-center gap-1.5 select-none">
              <CheckSquare className="w-3.5 h-3.5 text-primary" />
              Related Tasks
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {source.relatedTasks.map((task) => (
                <Badge
                  key={task}
                  variant="outline"
                  className="text-[11px] gap-1 px-2.5 py-1 font-normal bg-primary/5 border border-primary/10 text-foreground/90 rounded-lg"
                >
                  <CheckSquare className="w-3 h-3 text-primary" />
                  {task}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
