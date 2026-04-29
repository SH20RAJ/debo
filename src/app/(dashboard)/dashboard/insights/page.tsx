import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";

import { LifeInsights } from "@/components/dashboard/life/life-insights";
import { Card, CardContent } from "@/components/ui/card";
import { queryGraph, refreshMemoryGraph } from "@/lib/life/graph";
import { getJournalsCount } from "@/actions/journals";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function InsightsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/join");

  const journalCount = await getJournalsCount();
  let graph = await queryGraph("What do I work on most, who do I meet most, and what stresses me?", session.user.id);

  if (!graph.topPeople.length && journalCount > 0) {
    await refreshMemoryGraph(session.user.id);
    graph = await queryGraph("What do I work on most, who do I meet most, and what stresses me?", session.user.id);
  }

  return (
    <div className="relative min-h-screen flex-1 bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary-muted),transparent_45%),radial-gradient(circle_at_bottom_left,var(--primary-muted),transparent_45%)] opacity-25" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_90%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 lg:px-10">
        <header className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary shadow-sm backdrop-blur-md">
            Cognitive Mapping
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              The Shape of <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">Your Memory.</span>
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground/80 leading-relaxed">
              Debo synthesizes your daily records into deep structural insights, surfacing the strongest people, topics, and emotional patterns in your life.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="sm" className="rounded-full px-6 font-semibold">
              <Link href="/dashboard/ask">Ask Ranked Context</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full border-border/50 bg-background/50 px-6 font-semibold backdrop-blur-md transition-all hover:bg-muted/50">
              <Link href="/dashboard/timeline">Open Timeline</Link>
            </Button>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <MiniStat label="Journal Entries" value={journalCount.toString()} description="Chronological moments" />
          <MiniStat label="Entities Surface" value={graph.topPeople.length.toString()} description="Ranked people nodes" />
          <MiniStat label="Recurrence" value={graph.patterns.length.toString()} description="Pattern signals detected" />
        </div>

        <LifeInsights
          insights={graph.insights}
          topPeople={graph.topPeople}
          topTopics={graph.topTopics}
          topEmotions={graph.topEmotions}
          patterns={graph.patterns}
        />
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Insights | Debo",
  description: "Analyze the strongest people, topics, and repeating patterns in your life.",
};

function MiniStat({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-md transition-all hover:bg-card/60 hover:shadow-2xl hover:shadow-primary/5">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10 group-hover:scale-150" />
      <CardContent className="p-6 space-y-2 relative z-10">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors group-hover:text-primary/70">{label}</div>
        <div className="text-4xl font-bold tracking-tight transition-transform group-hover:translate-x-0.5">{value}</div>
        <div className="text-[10px] text-muted-foreground/50">{description}</div>
      </CardContent>
    </Card>
  );
}