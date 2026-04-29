import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getLifeTimeline } from "@/lib/life/timeline";
import { queryGraph, refreshMemoryGraph } from "@/lib/life/graph";
import { LifeTimeline } from "@/components/dashboard/life/life-timeline";
import { LifeInsights } from "@/components/dashboard/life/life-insights";
import { BarChart3, BookOpen, Plus, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getJournalsCount } from "@/actions/journals";

export default async function DashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/join");

    const [journalCount, timeline] = await Promise.all([
        getJournalsCount(),
        getLifeTimeline(session.user.id, "daily"),
    ]);

    let graph = await queryGraph("What recurring patterns stand out in my life?", session.user.id);

    if (!graph.topPeople.length && journalCount > 0) {
        await refreshMemoryGraph(session.user.id);
        graph = await queryGraph("What recurring patterns stand out in my life?", session.user.id);
    }

    const recentTimeline = timeline.slice(-4).reverse();
    const firstName = session.user.name.split(" ")[0];
    const recentEntryCount = recentTimeline.length;

  return (
    <div className="relative flex-1 bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary-muted),transparent_45%),radial-gradient(circle_at_bottom_left,var(--primary-muted),transparent_45%)] opacity-25" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_90%)]" />
      
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-12 lg:px-10">
        <header className="flex flex-col gap-8">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            Intelligence Engine Active
          </div>
          
          <div className="grid gap-10 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
                The Living Model <br />
                <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">of Your Life.</span>
              </h1>
              <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground/80">
                Welcome back, {firstName}. Debo has synthesized your recent moments into actionable cognitive patterns and emotional signals.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="lg" className="h-14 rounded-2xl px-8 text-base font-semibold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                  <Link href="/dashboard/ask">
                    <Search className="mr-2 h-5 w-5" />
                    Ask Your Past
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 rounded-2xl border-border/50 bg-background/50 px-8 text-base font-semibold backdrop-blur-xl transition-all hover:bg-muted/50">
                  <Link href="/dashboard/journal/new">
                    <Plus className="mr-2 h-5 w-5" />
                    New Entry
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Memories" value={journalCount.toString()} description="Total log entries" />
              <StatCard icon={<Sparkles className="h-5 w-5" />} label="Recent" value={recentEntryCount.toString()} description="Timeline nodes" />
              <StatCard icon={<BookOpen className="h-5 w-5" />} label="Patterns" value={graph.patterns.length.toString()} description="Recurrence detected" />
              <StatCard icon={<Search className="h-5 w-5" />} label="Signals" value={(graph.topPeople.length + graph.topTopics.length + graph.topEmotions.length).toString()} description="Graph connections" />
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

        <section className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          <LifeTimeline entries={recentTimeline} title="Chronological Pulse" />

          <div className="flex flex-col gap-6">
            <Card className="group relative overflow-hidden border-border/40 bg-card/40 p-8 backdrop-blur-md">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5 blur-3xl transition-colors group-hover:bg-primary/10" />
              <div className="relative space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold tracking-tight">Navigation</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Deep dive into specific cognitive layers of your journal.
                  </p>
                </div>
                <div className="grid gap-3">
                  <ShortcutLink href="/dashboard/insights" title="Signals" description="People, topics, and resonance" />
                  <ShortcutLink href="/dashboard/journals" title="Archive" description="Every moment, searchable" />
                  <ShortcutLink href="/dashboard/ask" title="Query Engine" description="LLM-powered life retrieval" />
                </div>
              </div>
            </Card>

            <Card className="border-border/40 bg-primary/5 p-6 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold">Pro Tip</div>
                  <p className="text-xs text-muted-foreground">
                    Try asking "What was I worried about 3 months ago?" to see how your perspective has shifted.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
    title: "Dashboard | Debo",
    description: "Your personal life intelligence dashboard: insights, timeline, and memory graph.",
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
        <Card className="group relative overflow-hidden border-border/50 bg-card/40 p-5 backdrop-blur-md transition-all hover:bg-card/60 hover:shadow-2xl hover:shadow-primary/5">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10 group-hover:scale-150" />
            <div className="relative z-10 space-y-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3">
                    {icon}
                </div>
                <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors group-hover:text-primary/70">{label}</div>
                    <div className="text-3xl font-bold tracking-tight transition-transform group-hover:translate-x-0.5">{value}</div>
                    <div className="text-[10px] text-muted-foreground/50">{description}</div>
                </div>
            </div>
        </Card>
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
        <Link href={href} className="group flex items-center justify-between rounded-2xl border border-border/50 bg-background/40 p-4 transition-all hover:border-primary/30 hover:bg-primary/5">
            <div className="space-y-0.5">
                <div className="text-sm font-bold tracking-tight">{title}</div>
                <div className="text-xs text-muted-foreground/70">{description}</div>
            </div>
            <div className="rounded-full bg-muted/50 p-2 opacity-0 transition-all group-hover:bg-primary/10 group-hover:opacity-100 group-hover:translate-x-1">
                <Plus className="h-3 w-3 text-primary" />
            </div>
        </Link>
    );
}
