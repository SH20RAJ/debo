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
    <section className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
      <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            <BrainCircuit className="h-4 w-4 text-primary" />
            Intelligence layer
          </div>
          <CardTitle className="text-xl">What Debo is seeing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.length > 0 ? (
            insights.map((insight) => (
              <div key={insight} className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-sm leading-relaxed text-foreground">
                {insight}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-6 text-sm text-muted-foreground">
              No strong insights yet. Keep journaling and Debo will begin connecting the dots.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Top people
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {topPeople.length > 0 ? topPeople.map((node) => <Badge key={node.name} className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">{node.name}</Badge>) : <span className="text-sm text-muted-foreground">No names surfaced yet.</span>}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Top topics
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {topTopics.length > 0 ? topTopics.map((node) => <Badge key={node.name} className="rounded-full bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10">{node.name}</Badge>) : <span className="text-sm text-muted-foreground">No topics surfaced yet.</span>}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Emotional tone
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {topEmotions.length > 0 ? topEmotions.map((node) => <Badge key={node.name} className="rounded-full bg-amber-500/10 text-amber-700 hover:bg-amber-500/10">{node.name}</Badge>) : <span className="text-sm text-muted-foreground">No emotions surfaced yet.</span>}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Repeated patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {patterns.length > 0 ? patterns.map((pattern) => (
              <div key={pattern.entity} className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                <span>{pattern.entity}</span>
                <span className="text-xs text-muted-foreground">{pattern.count}x</span>
              </div>
            )) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CircleAlert className="h-4 w-4" />
                Not enough repetition yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}