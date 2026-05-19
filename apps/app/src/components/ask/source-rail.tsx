"use client";

import {
  Mic,
  FileText,
  MessageSquare,
  CheckSquare,
  Brain,
  ArrowRight,
  BookOpen,
  Link2,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SourceCitation, type SourceData } from "./source-citation";

export interface RelatedMemory {
  id: string;
  type: SourceData["type"];
  title: string;
  meta: string;
}

const TYPE_ICON: Record<string, LucideIcon> = {
  voice: Mic,
  task: CheckSquare,
  journal: BookOpen,
  file: FileText,
  email: FileText,
  calendar: Calendar,
  link: Link2,
};

interface SourceRailProps {
  sources?: SourceData[];
  related?: RelatedMemory[];
  followUps?: string[];
  onFollowUpClick?: (question: string) => void;
  visible?: boolean;
}

export function SourceRail({
  sources = [],
  related = [],
  followUps = [],
  onFollowUpClick,
  visible = true,
}: SourceRailProps) {
  return (
    <aside
      className={cn(
        "w-80 border-l border-border bg-card/50 shrink-0 transition-all duration-200",
        "hidden lg:flex lg:flex-col",
        !visible && "lg:hidden"
      )}
    >
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Sources used */}
          {sources.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Sources used
              </h3>
              <div className="space-y-1.5">
                {sources.map((source) => (
                  <SourceCitation key={source.id} source={source} compact />
                ))}
              </div>
            </section>
          )}

          {sources.length > 0 && <Separator />}

          {/* Related memories */}
          {related.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Related memories
              </h3>
              <div className="space-y-1">
                {related.map((mem) => {
                  const Icon = TYPE_ICON[mem.type] || FileText;
                  return (
                    <Button
                      key={mem.id}
                      variant="ghost"
                      className="w-full justify-start gap-2.5 h-auto px-2.5 py-2.5 rounded-xl text-left group"
                    >
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted shrink-0">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {mem.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {mem.meta}
                        </p>
                      </div>
                      <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Button>
                  );
                })}
              </div>
            </section>
          )}

          {related.length > 0 && <Separator />}

          {/* Suggested follow-ups */}
          {followUps.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Suggested follow-ups
              </h3>
              <div className="space-y-1.5">
                {followUps.map((q, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    onClick={() => onFollowUpClick?.(q)}
                    className="w-full justify-start gap-2 h-auto px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Brain className="w-3 h-3 shrink-0 text-primary/60" />
                    <span className="line-clamp-2 text-left">{q}</span>
                  </Button>
                ))}
              </div>
            </section>
          )}

          {/* Empty state when no sources yet */}
          {sources.length === 0 && related.length === 0 && followUps.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Brain className="w-8 h-8 text-muted-foreground/30 mb-3" />
              <p className="text-xs text-muted-foreground">
                Sources and citations will appear here after you ask a question.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
