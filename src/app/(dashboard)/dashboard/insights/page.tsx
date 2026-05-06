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
    <div className="flex-1 bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col gap-10">
          <div className="inline-flex items-center gap-2 self-start rounded-xl border-2 border-duo-swan bg-duo-polar px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-duo-wolf">
            <Sparkles className="h-4 w-4 text-duo-macaw animate-bounce-subtle" />
            LIFE INSIGHTS
          </div>
          <div className="space-y-6">
              <h1 className="text-4xl font-heading font-black tracking-tight text-duo-eel md:text-5xl lg:text-6xl leading-[1.1]">
                Your Memory <br />
                <span className="text-duo-swan">Patterns.</span>
              </h1>
              <p className="max-w-2xl text-xl font-bold text-duo-wolf leading-relaxed">
                Debo looks at your daily notes to show you the people, topics, and feelings that appear most often.
              </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button
              asChild
              variant="duolingo-outline"
              size="lg"
            >
              <Link href="/dashboard/ask">Ask AI</Link>
            </Button>
            <Button
              asChild
              variant="duolingo-outline"
              size="lg"
            >
              <Link href="/dashboard/timeline">Open Timeline</Link>
            </Button>
          </div>
        </header>

        <div className="grid gap-6 sm:grid-cols-3">
          <MiniStat
            label="Journal Entries"
            value={journalCount.toString()}
            description="Total notes"
            color="text-duo-green"
          />
          <MiniStat
            label="People & Places"
            value={graph.topPeople.length.toString()}
            description="People you mention"
            color="text-duo-blue"
          />
          <MiniStat
            label="Patterns"
            value={graph.patterns.length.toString()}
            description="Recurring themes"
            color="text-duo-purple"
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
  color,
}: {
  label: string;
  value: string;
  description: string;
  color: string;
}) {
  return (
    <div className="duo-card hover-bounce flex flex-col items-center justify-center p-8 text-center group">
      <div className="space-y-1">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-duo-swan mb-2">
          {label}
        </div>
        <div className={`text-4xl font-heading font-black ${color} group-hover:scale-110 transition-transform`}>
          {value}
        </div>
        <div className="text-[10px] font-black text-duo-wolf uppercase tracking-wider">
          {description}
        </div>
      </div>
    </div>
  );
}
