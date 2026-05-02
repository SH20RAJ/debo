import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";

import { LifeInsights } from "@/components/dashboard/life/life-insights";
import { queryGraph, refreshMemoryGraph } from "@/lib/life/graph";
import { getJournalsCount } from "@/actions/journals";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function InsightsPage() {
  const user = await stackServerApp.getUser();
  if (!user) redirect("/join");

  const journalCount = await getJournalsCount();
  let graph = await queryGraph(
    "What do I work on most, who do I meet most, and what stresses me?",
    user.id,
  );

  if (!graph.topPeople.length && journalCount > 0) {
    await refreshMemoryGraph(user.id);
    graph = await queryGraph(
      "What do I work on most, who do I meet most, and what stresses me?",
      user.id,
    );
  }

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12 lg:px-8">
        <header className="flex flex-col gap-10">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-muted/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Life Insights
          </div>
          <div className="space-y-6">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Your Memory <br />
                <span className="text-muted-foreground/40">Patterns.</span>
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
                Debo looks at your daily notes to show you the people, topics, and feelings that appear most often.
              </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 rounded-xl border-border bg-background px-6 text-xs font-medium transition-all hover:bg-muted/50"
            >
              <Link href="/dashboard/ask">Ask AI</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 rounded-xl border-border bg-background px-6 text-xs font-medium transition-all hover:bg-muted/50"
            >
              <Link href="/dashboard/timeline">Open Timeline</Link>
            </Button>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <MiniStat
            label="Journal Entries"
            value={journalCount.toString()}
            description="Total notes"
          />
          <MiniStat
            label="People & Places"
            value={graph.topPeople.length.toString()}
            description="People you mention often"
          />
          <MiniStat
            label="Patterns"
            value={graph.patterns.length.toString()}
            description="Recurring themes found"
          />
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
  title: "Insights",
  description:
    "Analyze the strongest people, topics, and repeating patterns in your life.",
};

function MiniStat({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="group space-y-4 rounded-2xl glass-card p-6 transition-all">
      <div className="space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 transition-colors group-hover:text-primary/70">
          {label}
        </div>
        <div className="text-3xl font-semibold tracking-tight transition-transform group-hover:translate-x-0.5">
          {value}
        </div>
        <div className="text-[10px] text-muted-foreground/40 italic">
          {description}
        </div>
      </div>
    </div>
  );
}
