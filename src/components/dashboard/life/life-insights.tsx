import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, CircleAlert } from "lucide-react";

type RankedNode = {
  type: "person" | "topic" | "emotion" | "event";
  name: string;
  score?: number;
};

export function LifeInsights({
  insights,
  topPeople,
  topTopics,
  topEmotions,
  patterns,
}: {
  insights: string[];
  topPeople: RankedNode[];
  topTopics: RankedNode[];
  topEmotions: RankedNode[];
  patterns: Array<{ entity: string; count: number }>;
}) {
  return (
    <section className="grid gap-8 xl:grid-cols-[1fr_400px]">
      <div className="space-y-6 rounded-2xl glass p-6">
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Cognitive Analysis
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Intelligence Feed</h2>
          </div>
        </header>

        <div className="space-y-3">
          {insights.length > 0 ? (
            insights.map((insight) => (
              <div 
                key={insight} 
                className="relative overflow-hidden rounded-xl glass-card px-5 py-4 text-sm leading-relaxed text-foreground transition-all hover:bg-muted/10"
              >
                <div className="absolute left-0 top-0 h-full w-0.5 bg-primary/40" />
                {insight}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/5 px-6 py-16 text-center">
               <BrainCircuit className="h-8 w-8 text-muted-foreground/20 mb-4" />
               <h3 className="text-sm font-semibold text-foreground">Awaiting Signals</h3>
               <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-muted-foreground/50">
                 Deep patterns are still forming. Keep writing to unlock personalized insights.
               </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl glass-card p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">
              Top Entities
            </div>
            <div className="flex flex-wrap gap-2">
              {topPeople.length > 0 ? (
                topPeople.map((node) => (
                  <div key={node.name} className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary">
                    {node.name}
                  </div>
                ))
              ) : (
                <span className="text-[11px] text-muted-foreground italic">None tracked</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl glass-card p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">
              Key Topics
            </div>
            <div className="flex flex-wrap gap-2">
              {topTopics.length > 0 ? (
                topTopics.map((node) => (
                  <div key={node.name} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    {node.name}
                  </div>
                ))
              ) : (
                <span className="text-[11px] text-muted-foreground italic">No topics identified</span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl glass-card p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">
            Emotional Resonance
          </div>
          <div className="flex flex-wrap gap-2">
            {topEmotions.length > 0 ? (
              topEmotions.map((node) => (
                <div key={node.name} className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                  {node.name}
                </div>
              ))
            ) : (
              <span className="text-[11px] text-muted-foreground italic">Listening for cues...</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl glass overflow-hidden">
          <div className="p-5 border-b border-border/40 bg-muted/20">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Recurring Frequency
            </div>
          </div>
          <div className="divide-y divide-border">
            {patterns.length > 0 ? (
              patterns.map((pattern) => (
                <div 
                  key={pattern.entity} 
                  className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-muted/30"
                >
                  <span className="text-[13px] font-medium">{pattern.entity}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground/60">{pattern.count}x</span>
                    <div className="h-1 w-12 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary/30" 
                        style={{ width: `${Math.min(100, (pattern.count / 10) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 px-5 py-6 text-[11px] text-muted-foreground italic">
                <CircleAlert className="h-3.5 w-3.5" />
                Patterns will surface as you record more.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}