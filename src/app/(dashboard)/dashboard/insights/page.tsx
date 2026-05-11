import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";

import { queryGraph, refreshMemoryGraph } from "@/lib/life/graph";
import { getJournalsCount } from "@/actions/journals";
import { InsightsHero } from "@/components/dashboard/life/insights-hero";
import { PatternList } from "@/components/dashboard/life/pattern-list";
import { BrainCircuit } from "lucide-react";

const INSIGHTS_QUERY = "What do I work on most, who do I meet most, and what stresses me?";

export const metadata: Metadata = {
  title: "Insights",
  description: "Cognitive analysis of your journal patterns.",
};

export default async function InsightsPage() {
  const user = await stackServerApp.getUser();
  if (!user) redirect("/join");

  const [journalCount, initialGraph] = await Promise.all([
    getJournalsCount(),
    queryGraph(INSIGHTS_QUERY, user.id),
  ]);

  let graph = initialGraph;

  // Refresh graph if it's empty but user has journals
  if (graph.patterns.length === 0 && journalCount > 0) {
    await refreshMemoryGraph(user.id);
    graph = await queryGraph(INSIGHTS_QUERY, user.id);
  }

  // Map to new types
  const topPerson = graph.topPeople[0] || null;
  const topEmotion = graph.topEmotions[0] || null;
  const topTopic = graph.topTopics[0] || null;

  return (
    <div className="flex-1 bg-duo-polar">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-12 lg:px-8">
        <header className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 self-start rounded-xl border-2 border-duo-swan bg-duo-snow px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-duo-wolf">
            <BrainCircuit className="h-4 w-4 text-duo-macaw" />
            Cognitive Analysis
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-duo-eel md:text-6xl">
              AI Insights
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-bold leading-relaxed text-duo-wolf">
              Debo looks at your daily notes to show you the people, topics, and feelings that appear most often.
            </p>
          </div>
        </header>

        <InsightsHero 
          topPerson={topPerson} 
          topEmotion={topEmotion} 
          topTopic={topTopic} 
        />

        <div className="space-y-6">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-duo-wolf">
            Life Patterns
          </div>
          <PatternList patterns={graph.patterns} />
        </div>
      </div>
    </div>
  );
}
