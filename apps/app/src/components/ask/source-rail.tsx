"use client";

import {
  Mic,
  FileText,
  MessageSquare,
  CheckSquare,
  Link2,
  Brain,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceCitation, type SourceData } from "./source-citation";

// Mock data for the source rail
const MOCK_SOURCES: SourceData[] = [
  {
    id: "1",
    type: "voice",
    label: "Voice note",
    detail: "Marketing Sync · 0:12",
    confidence: "strong",
    excerpt:
      "I promised Raj I'll send the finalized Q4 budget allocation by Friday before the board meeting.",
    timestamp: "0:12",
    people: ["Raj"],
    relatedTasks: ["Send Q4 budget to Raj"],
  },
  {
    id: "2",
    type: "task",
    label: "Task",
    detail: "Q4 Budget Follow-up",
    confidence: "strong",
    relatedTasks: ["Send Q4 budget to Raj"],
  },
];

const MOCK_RELATED = [
  {
    id: "r1",
    icon: FileText,
    title: "Q4 Allocation Draft.pdf",
    meta: "Uploaded 2 days ago",
  },
  {
    id: "r2",
    icon: MessageSquare,
    title: "Email from Raj about budget",
    meta: "Last Tuesday",
  },
  {
    id: "r3",
    icon: CheckSquare,
    title: "Board meeting prep",
    meta: "Calendar · Friday",
  },
];

const MOCK_FOLLOWUPS = [
  "What else did I discuss in that meeting?",
  "Show me all tasks related to Q4 budget",
  "When is the board meeting?",
  "What did Raj say in his last email?",
];

interface SourceRailProps {
  visible?: boolean;
}

export function SourceRail({ visible = true }: SourceRailProps) {
  return (
    <aside
      className={cn(
        "w-80 border-l border-border bg-card/50 overflow-y-auto shrink-0 transition-all duration-200",
        "hidden lg:block",
        !visible && "lg:hidden"
      )}
    >
      <div className="p-4 space-y-6">
        {/* Sources used */}
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Sources used
          </h3>
          <div className="space-y-1.5">
            {MOCK_SOURCES.map((source) => (
              <SourceCitation key={source.id} source={source} />
            ))}
          </div>
        </section>

        {/* Related memories */}
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Related memories
          </h3>
          <div className="space-y-2">
            {MOCK_RELATED.map((mem) => {
              const Icon = mem.icon;
              return (
                <button
                  key={mem.id}
                  className="flex items-start gap-2.5 w-full text-left p-2.5 rounded-xl hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {mem.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{mem.meta}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Suggested follow-ups */}
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Suggested follow-ups
          </h3>
          <div className="space-y-1.5">
            {MOCK_FOLLOWUPS.map((q, i) => (
              <button
                key={i}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <Brain className="w-3 h-3 shrink-0 text-primary/60" />
                <span className="line-clamp-2">{q}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
