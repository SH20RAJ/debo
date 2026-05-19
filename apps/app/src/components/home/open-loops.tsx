"use client";

import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-foreground font-[var(--font-nunito)]">
          Open Loops
        </h2>
        <Badge
          variant="outline"
          className="rounded-full text-[11px] px-2 py-0.5 border-amber-300 text-amber-600 dark:text-amber-400 dark:border-amber-500/40"
        >
          {mockLoops.length}
        </Badge>
      </div>
      <div className="space-y-3">
        {mockLoops.map((loop) => (
          <Card
            key={loop.id}
            className={cn(
              "rounded-2xl border-2 border-border bg-card p-0",
              "transition-all duration-200",
              "hover:border-amber-300/60 dark:hover:border-amber-500/30 hover:shadow-sm"
            )}
          >
            <CardContent className="flex items-start gap-3 p-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {loop.text}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {loop.source}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => toast.success("Marked as done")}
                    className="text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark done
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => toast.info("Coming soon")}
                    className="text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Ask about this
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
