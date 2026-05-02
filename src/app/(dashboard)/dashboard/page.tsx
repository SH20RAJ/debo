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
import { getJournalsCount } from "@/actions/journals";
import { stackServerApp } from "@/stack/server";

export default async function DashboardPage() {
  const userId = await resolveUserId();
  if (!userId) redirect("/join");
  
  const user = await stackServerApp.getUser(); // Still need for display name

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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12 lg:px-8">
        <header className="flex flex-col gap-10">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-muted/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            AI is Ready
          </div>

          <div className="grid gap-12 xl:grid-cols-[1fr_400px]">
            <div className="space-y-8">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Your Personal <br />
                <span className="text-muted-foreground/40">Memory Engine.</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                Welcome back, {firstName}. Debo has looked at your recent notes to find patterns and insights.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-xl px-6 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  <Link href="/dashboard/ask">
                    <Search className="mr-2 h-4 w-4" />
                    Ask Questions
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl border-border bg-background px-6 text-sm font-medium transition-all hover:bg-muted/50 active:scale-[0.98]"
                >
                  <Link href="/dashboard/journal/new">
                    <Plus className="mr-2 h-4 w-4" />
                    New Entry
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<BarChart3 className="h-4 w-4" />}
                label="Memories"
                value={journalCount.toString()}
                description="Journal entries"
              />
              <StatCard
                icon={<Sparkles className="h-4 w-4" />}
                label="Recent"
                value={recentEntryCount.toString()}
                description="New items"
              />
              <StatCard
                icon={<BookOpen className="h-4 w-4" />}
                label="Patterns"
                value={graph.patterns.length.toString()}
                description="Recurring themes"
              />
              <StatCard
                icon={<Search className="h-4 w-4" />}
                label="Signals"
                value={(
                  graph.topPeople.length +
                  graph.topTopics.length +
                  graph.topEmotions.length
                ).toString()}
                description="Memory nodes"
              />
            </div>
          </div>
        </header>

        <LifeInsights
          insights={graph.insights}
          topPeople={graph.topPeople}
          topTopics={graph.topTopics}
          topEmotions={graph.topEmotions}
          patterns={graph.patterns}
        />

        <section className="grid gap-12 xl:grid-cols-[1fr_400px]">
          <LifeTimeline entries={recentTimeline} title="Recent Notes" />

          <div className="flex flex-col gap-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold tracking-tight">
                  Explore
                </h3>
                <p className="text-sm text-muted-foreground">
                  Look at different parts of your memory.
                </p>
              </div>
              <div className="grid gap-2">
                <ShortcutLink
                  href="/dashboard/insights"
                  title="Insights"
                  description="People, topics, and feelings"
                />
                <ShortcutLink
                  href="/dashboard/journals"
                  title="Archive"
                  description="Every moment, searchable"
                />
                <ShortcutLink
                  href="/dashboard/ask"
                  title="Ask AI"
                  description="Search your memory with AI"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background border border-border text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold">Pro Tip</div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="group space-y-3 rounded-2xl glass-card p-5 transition-all">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        {icon}
      </div>
      <div className="space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 transition-colors group-hover:text-primary/70">
          {label}
        </div>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <div className="text-[10px] text-muted-foreground/40 italic">
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
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/20 hover:bg-muted/30"
    >
      <div className="space-y-0.5">
        <div className="text-sm font-semibold tracking-tight">{title}</div>
        <div className="text-[11px] text-muted-foreground/70">
          {description}
        </div>
      </div>
      <Plus className="h-3.5 w-3.5 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}
