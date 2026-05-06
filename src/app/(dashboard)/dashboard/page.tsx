import { resolveUserId } from "@/actions/auth-sync";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getLifeTimeline } from "@/lib/life/timeline";
import { queryGraph, refreshMemoryGraph } from "@/lib/life/graph";
import { LifeTimeline } from "@/components/dashboard/life/life-timeline";
import { LifeInsights } from "@/components/dashboard/life/life-insights";
import { BarChart3, BookOpen, Plus, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { getJournalsCount } from "@/actions/journals";
import { stackServerApp } from "@/stack/server";

export default async function DashboardPage() {
  const userId = await resolveUserId();
  if (!userId) redirect("/join");
  
  const user = await stackServerApp.getUser();
  if (!user) redirect("/join");

  const [journalCount, timeline] = await Promise.all([
    getJournalsCount(),
    getLifeTimeline(userId, "daily"),
  ]);

  let graph = await queryGraph(
    "What recurring patterns stand out in my life?",
    userId,
  );

  if (!graph.topPeople.length && journalCount > 0) {
    await refreshMemoryGraph(userId);
    graph = await queryGraph(
      "What recurring patterns stand out in my life?",
      userId,
    );
  }

  const recentTimeline = timeline.slice(-4).reverse();
  const firstName = (user.displayName ?? "there").split(" ")[0];
  const recentEntryCount = recentTimeline.length;

  return (
    <div className="relative flex-1 bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12 lg:px-8">
        <header className="flex flex-col gap-10">
          <div className="inline-flex items-center gap-2 self-start rounded-xl border-2 border-duo-swan bg-duo-polar px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-duo-wolf animate-in fade-in slide-in-from-left-4 duration-500">
            <Sparkles className="h-4 w-4 text-duo-blue animate-bounce-subtle" />
            AI IS READY
          </div>

          <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
            <div className="space-y-8 text-center lg:text-left">
              <h1 className="text-4xl font-heading font-black tracking-tight text-duo-eel md:text-5xl lg:text-6xl leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700">
                Your <br />
                <span className="text-duo-swan">Memory Engine.</span>
              </h1>
              <p className="max-w-xl text-xl font-bold leading-relaxed text-duo-wolf animate-in fade-in slide-in-from-bottom-6 duration-700">
                Welcome back, {firstName}. Debo found patterns in your recent notes.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Button
                  asChild
                  variant="duolingo"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Link href="/dashboard/ask">
                    <Search className="mr-2 h-5 w-5" />
                    Ask Questions
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="duolingo-outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Link href="/dashboard/journal/new">
                    <Plus className="mr-2 h-5 w-5" />
                    New Entry
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative w-48 h-48 animate-float">
                <Image 
                  src="/mascot.png" 
                  alt="Debo Mascot" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <StatCard
                  icon={<BarChart3 className="h-6 w-6" />}
                  label="Memories"
                  value={journalCount.toString()}
                  description="Total notes"
                  color="text-duo-green"
                  borderColor="border-duo-feather"
                />
                <StatCard
                  icon={<Sparkles className="h-6 w-6" />}
                  label="Recent"
                  value={recentEntryCount.toString()}
                  description="Recent notes"
                  color="text-duo-blue"
                  borderColor="border-duo-macaw"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <StatCard
            icon={<BookOpen className="h-6 w-6" />}
            label="Patterns"
            value={graph.patterns.length.toString()}
            description="Life themes"
            color="text-duo-purple"
            borderColor="border-duo-beetle"
          />
          <StatCard
            icon={<Search className="h-6 w-6" />}
            label="Signals"
            value={(
              graph.topPeople.length +
              graph.topTopics.length +
              graph.topEmotions.length
            ).toString()}
            description="Total facts"
            color="text-duo-orange"
            borderColor="border-duo-fox"
          />
        </div>

        <LifeInsights
          insights={graph.insights}
          topPeople={graph.topPeople}
          topTopics={graph.topTopics}
          topEmotions={graph.topEmotions}
          patterns={graph.patterns}
        />

        <section className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <LifeTimeline entries={recentTimeline} title="Recent Notes" />

          <div className="flex flex-col gap-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-heading font-black text-duo-eel uppercase tracking-wider">
                  Quick Access
                </h3>
                <p className="text-base font-bold text-duo-wolf">
                  Check your memories.
                </p>
              </div>
              <div className="grid gap-3">
                <ShortcutLink
                  href="/dashboard/insights"
                  title="Insights"
                  description="Life patterns"
                  iconColor="text-duo-purple"
                />
                <ShortcutLink
                  href="/dashboard/journals"
                  title="Archive"
                  description="View old notes"
                  iconColor="text-duo-blue"
                />
                <ShortcutLink
                  href="/dashboard/ask"
                  title="Ask AI"
                  description="Chat with AI"
                  iconColor="text-duo-green"
                />
              </div>
            </div>

            <div className="duo-card">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background border-2 border-duo-swan text-duo-blue">
                  <Sparkles className="h-6 w-6 animate-bounce-subtle" />
                </div>
                <div className="space-y-1">
                  <div className="text-base font-black text-duo-eel uppercase tracking-wider">Pro Tip</div>
                  <p className="text-sm font-bold leading-relaxed text-duo-wolf">
                    Try asking &quot;What was I worried about 3 months ago?&quot; to see
                    how your perspective has shifted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your personal life intelligence dashboard: insights, timeline, and memory graph.",
};

function StatCard({
  icon,
  label,
  value,
  description,
  color,
  borderColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  color: string;
  borderColor: string;
}) {
  return (
    <div className="duo-card flex flex-col items-center justify-center p-6 text-center group">
      <div className={`p-3 rounded-xl bg-duo-polar border-2 ${borderColor} ${color} mb-4 transition-transform group-hover:scale-110 group-hover:animate-wiggle`}>
        {icon}
      </div>
      <div className="space-y-1">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-duo-swan">
          {label}
        </div>
        <div className="text-3xl font-heading font-black text-duo-eel">{value}</div>
        <div className="text-[10px] font-black text-duo-wolf uppercase tracking-wider">
          {description}
        </div>
      </div>
    </div>
  );
}

function ShortcutLink({
  href,
  title,
  description,
  iconColor,
}: {
  href: string;
  title: string;
  description: string;
  iconColor: string;
}) {
  return (
    <Link
      href={href}
      className="duo-card group flex items-center justify-between p-5"
    >
      <div className="space-y-0.5">
        <div className="text-base font-black text-duo-eel uppercase tracking-wider">{title}</div>
        <div className="text-xs font-bold text-duo-wolf">
          {description}
        </div>
      </div>
      <Plus className={`h-5 w-5 ${iconColor} opacity-50 transition-all group-hover:translate-x-1 group-hover:opacity-100`} />
    </Link>
  );
}
