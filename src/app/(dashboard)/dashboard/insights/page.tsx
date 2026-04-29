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
    <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(234,88,12,0.08),_transparent_24%),linear-gradient(180deg,_rgba(248,250,252,0.92),_rgba(241,245,249,0.72))] dark:bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.08),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(234,88,12,0.06),_transparent_24%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,0.92))]">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 lg:px-8">
        <section className="rounded-[2rem] border border-border/70 bg-card/80 p-8 shadow-xl shadow-black/5 backdrop-blur-sm">
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Insights</div>
            <h1 className="text-4xl font-semibold tracking-tight">The shape of your memory</h1>
            <p className="max-w-2xl text-muted-foreground">
              Debo ranks the strongest people, topics, emotions, and repeated patterns so you can spot what keeps surfacing.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-full px-5">
              <Link href="/dashboard/ask">Ask the ranked context</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href="/dashboard/timeline">Open timeline</Link>
            </Button>
          </div>
        </section>

        <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
          <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
            <MiniStat label="Journal entries" value={journalCount.toString()} />
            <MiniStat label="People surfaced" value={graph.topPeople.length.toString()} />
            <MiniStat label="Recurring patterns" value={graph.patterns.length.toString()} />
          </CardContent>
        </Card>

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
  title: "Insights",
  description: "Analyze the strongest people, topics, and repeating patterns in your life.",
};

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}