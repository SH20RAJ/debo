"use client";

import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OpenLoop {
  id: string;
  text: string;
  source: string;
}

const mockLoops: OpenLoop[] = [
  {
    id: "1",
    text: "You promised Raj the Q4 budget by Friday.",
    source: "Voice note · Marketing Sync",
  },
  {
    id: "2",
    text: "You saved 5 product ideas but didn't tag them.",
    source: "Journal · Product Ideas",
  },
  {
    id: "3",
    text: 'You mentioned "landing page revamp" in 3 places.',
    source: "Multiple sources",
  },
  {
    id: "4",
    text: "You have 2 unreviewed voice notes.",
    source: "Voice notes · Inbox",
  },
];

export function OpenLoops() {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Open Loops
      </h2>
      <div className="space-y-3">
        {mockLoops.map((loop) => (
          <div
            key={loop.id}
            className={cn(
              "flex items-start gap-3 rounded-2xl border-2 border-border bg-card p-4",
              "transition-all duration-200 hover:border-amber-300/50 dark:hover:border-amber-500/30"
            )}
          >
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {loop.text}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {loop.source}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => toast.success("Marked as done")}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg hover:bg-accent transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark done
                </button>
                <button
                  onClick={() => toast.info("Coming soon")}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg hover:bg-accent transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Ask about this
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
