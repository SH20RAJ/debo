"use client";

import {
  Mic,
  FileText,
  CheckSquare,
  Calendar,
  BookOpen,
  Link2,
  Brain,
  ArrowRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SourceCitation, type SourceData } from "./source-citation";
import { motion } from "framer-motion";

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
        "w-80 border-l border-border bg-card/45 backdrop-blur-2xl shrink-0 transition-all duration-300 ease-in-out relative z-10 min-h-0",
        "hidden lg:flex lg:flex-col",
        !visible && "lg:hidden"
      )}
    >
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4.5 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2 px-1 py-1.5 select-none">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs font-extrabold text-foreground/80 uppercase tracking-widest font-[var(--font-nunito)]">
              Intelligence Rail
            </h2>
          </div>

          <Separator className="bg-border" />

          {/* Sources used */}
          {sources.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-widest px-1 select-none">
                Sources Used
              </h3>
              <div className="space-y-2">
                {sources.map((source, idx) => (
                  <motion.div
                    key={source.id}
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05, duration: 0.2 }}
                  >
                    <SourceCitation source={source} compact />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {sources.length > 0 && (related.length > 0 || followUps.length > 0) && (
            <Separator className="bg-border" />
          )}

          {/* Related memories */}
          {related.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-widest px-1 select-none">
                Related Memories
              </h3>
              <div className="space-y-1.5">
                {related.map((mem, idx) => {
                  const Icon = TYPE_ICON[mem.type] || FileText;
                  return (
                    <motion.div
                      key={mem.id}
                      initial={{ y: 6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05, duration: 0.2 }}
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-auto px-3 py-3 rounded-xl text-left border border-transparent transition-all duration-200 group",
                          "bg-muted/30 hover:bg-muted/60 hover:border-border"
                        )}
                      >
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/5 border border-emerald-500/10 shrink-0 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
                           <Icon className="w-3.5 h-3.5 text-emerald-500/80" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground/95 truncate">
                            {mem.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            {mem.meta}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-emerald-500/60 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {related.length > 0 && followUps.length > 0 && (
            <Separator className="bg-border" />
          )}

          {/* Suggested follow-ups */}
          {followUps.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-widest px-1 select-none">
                Suggested Follow-Ups
              </h3>
              <div className="space-y-2">
                {followUps.map((q, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05, duration: 0.2 }}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => onFollowUpClick?.(q)}
                      className={cn(
                        "w-full justify-between gap-3 h-auto px-3.5 py-3 rounded-xl text-xs font-semibold text-muted-foreground transition-all duration-200 text-left border border-border",
                        "bg-muted/25 hover:bg-muted/50 hover:text-foreground hover:border-emerald-500/20 group cursor-pointer"
                      )}
                    >
                      <div className="flex gap-2.5 items-start min-w-0">
                        <Brain className="w-3.5 h-3.5 shrink-0 text-emerald-500/60 group-hover:text-emerald-500 transition-colors mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{q}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-emerald-500/60 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 shrink-0 self-center" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Empty state when no sources yet */}
          {sources.length === 0 && related.length === 0 && followUps.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center select-none">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 mb-4">
                <Brain className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground/65 max-w-[200px] leading-relaxed">
                Sources, citations, and related memories will appear here as you ask questions.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
