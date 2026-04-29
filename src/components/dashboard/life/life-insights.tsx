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
    <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <Card className="group border-border/50 bg-card/40 backdrop-blur-md transition-all hover:bg-card/60">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
                Cognitive Analysis
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Intelligence Feed</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.length > 0 ? (
            insights.map((insight, i) => (
              <div 
                key={insight} 
                className="relative overflow-hidden rounded-2xl border border-border/40 bg-muted/30 px-5 py-4 text-sm leading-relaxed text-foreground transition-colors hover:bg-muted/50"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-primary/30" />
                {insight}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border/60 bg-muted/10 px-6 py-16 text-center text-sm text-muted-foreground">
               <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/20 p-4">
                  <BrainCircuit className="h-8 w-8 opacity-20" />
               </div>
               <h3 className="mb-1 text-base font-semibold text-foreground">Awaiting Signals</h3>
               <p className="max-w-[240px] text-xs leading-relaxed text-muted-foreground/60">
                 Deep patterns are still forming. Keep writing to unlock personalized insights and cognitive resonance.
               </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader className="pb-3 pt-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                Top Entities
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {topPeople.length > 0 ? (
                topPeople.map((node) => (
                  <Badge key={node.name} variant="outline" className="rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-primary hover:bg-primary/10">
                    {node.name}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground/50 italic">No people tracked</span>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader className="pb-3 pt-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                Key Topics
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {topTopics.length > 0 ? (
                topTopics.map((node) => (
                  <Badge key={node.name} variant="outline" className="rounded-full border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400">
                    {node.name}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground/50 italic">No topics identified</span>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50 bg-card/40 backdrop-blur-md">
          <CardHeader className="pb-4 pt-5">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                Emotional Resonance
              </div>
              <div className="h-2 w-24 rounded-full bg-muted shadow-inner">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 opacity-60" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pb-6">
            {topEmotions.length > 0 ? (
              topEmotions.map((node) => (
                <Badge key={node.name} variant="outline" className="rounded-full border-amber-500/20 bg-amber-500/5 px-3 py-1 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400">
                  {node.name}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground/50 italic">Listening for emotional cues...</span>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/50 bg-card/40 backdrop-blur-md">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              Recurring Frequency
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 p-0">
            {patterns.length > 0 ? (
              patterns.map((pattern) => (
                <div 
                  key={pattern.entity} 
                  className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-primary/5 border-b border-border/10 last:border-0"
                >
                  <span className="text-sm font-medium">{pattern.entity}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary/60">{pattern.count}x</span>
                    <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary/40" 
                        style={{ width: `${Math.min(100, (pattern.count / 10) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 px-5 py-6 text-sm text-muted-foreground/40">
                <CircleAlert className="h-4 w-4" />
                Patterns will surface as you record more life moments.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}