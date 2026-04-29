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
        <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(233,196,106,0.18),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_rgba(248,250,252,0.9),_rgba(241,245,249,0.72))] dark:bg-[radial-gradient(circle_at_top_right,_rgba(233,196,106,0.12),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.08),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,0.92))]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[size:42px_42px] opacity-20 dark:opacity-10" />
            <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-8 lg:px-8">
                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-6 rounded-[2rem] border border-border/70 bg-card/80 p-8 shadow-xl shadow-black/5 backdrop-blur-sm">
                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Debo intelligence dashboard
                        </div>
                        <div className="space-y-4">
                            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance text-foreground md:text-5xl">
                                Good day, {firstName}. Your journal is becoming a living model of your life.
                            </h1>
                            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                                Debo now groups your entries into chunks, ranks them with memory context, and maps repeating patterns across people, topics, and emotions.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link href="/dashboard/ask">
                                <Button className="h-12 rounded-2xl px-6 gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-95">
                                    <Search className="h-4 w-4" />
                                    Ask your past
                                </Button>
                            </Link>
                            <Link href="/dashboard/journal/new">
                                <Button variant="outline" className="h-12 rounded-2xl px-6 gap-2 border-border/80 bg-background/60 backdrop-blur-sm transition-all hover:border-primary/40 hover:text-primary">
                                    <Plus className="h-4 w-4" />
                                    New Entry
                                </Button>
                            </Link>
                            <Link href="/dashboard/timeline">
                                <Button variant="ghost" className="h-12 rounded-2xl px-6 gap-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                                    <BookOpen className="h-4 w-4" />
                                    Timeline
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                        <StatCard icon={<BarChart3 className="h-4 w-4" />} label="Entries" value={journalCount.toString()} hint="Total journal entries" />
                        <StatCard icon={<Sparkles className="h-4 w-4" />} label="Recent" value={recentEntryCount.toString()} hint="Timeline entries shown here" />
                        <StatCard icon={<BookOpen className="h-4 w-4" />} label="Patterns" value={graph.patterns.length.toString()} hint="Recurring entities surfaced" />
                        <StatCard icon={<Search className="h-4 w-4" />} label="Signals" value={(graph.topPeople.length + graph.topTopics.length + graph.topEmotions.length).toString()} hint="Connected graph signals" />
                    </div>
                </section>

                <LifeInsights
                    insights={graph.insights}
                    topPeople={graph.topPeople}
                    topTopics={graph.topTopics}
                    topEmotions={graph.topEmotions}
                    patterns={graph.patterns}
                />

                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] pb-10">
                    <LifeTimeline entries={recentTimeline} title="Recent timeline" />

                    <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
                        <CardContent className="space-y-6 p-6">
                            <div className="space-y-2">
                                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Shortcuts</div>
                                <h2 className="text-2xl font-semibold tracking-tight">Move through your memory faster</h2>
                                <p className="text-sm leading-6 text-muted-foreground">
                                    Use the dedicated views when you want the full timeline, deeper graph patterns, or a clean archive.
                                </p>
                            </div>

                            <div className="grid gap-3">
                                <ShortcutLink href="/dashboard/insights" title="Insights" description="Top people, topics, and recurring signals" />
                                <ShortcutLink href="/dashboard/journals" title="Archive" description="Browse every journal entry in one place" />
                                <ShortcutLink href="/dashboard/ask" title="Ask Life" description="Query the ranked context layer directly" />
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Your personal life intelligence dashboard: insights, timeline, and memory graph.",
};

function StatCard({
    icon,
    label,
    value,
    hint,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    hint: string;
}) {
    return (
        <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {icon}
                </div>
                <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
                    <div className="text-2xl font-semibold tracking-tight">{value}</div>
                    <div className="text-xs text-muted-foreground">{hint}</div>
                </div>
            </CardContent>
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
        <Link href={href} className="group rounded-2xl border border-border/70 bg-background/70 p-4 transition-all hover:border-primary/30 hover:bg-primary/5">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <div className="text-sm font-semibold">{title}</div>
                    <div className="text-sm text-muted-foreground">{description}</div>
                </div>
                <div className="text-primary transition-transform group-hover:translate-x-0.5">→</div>
            </div>
        </Link>
    );
}
