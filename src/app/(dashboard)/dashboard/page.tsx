import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { JournalTimeline } from "@/components/journal/journal-timeline";
import { getJournals } from "@/actions/journals";
import { Brain, Sparkles, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/join");

    const journals = await getJournals();

    return (
        <div className="flex-1 space-y-12 p-8 pt-6 max-w-6xl mx-auto">
            {/* Minimalist Hero/Greeting */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">Good day, {session.user.name.split(" ")[0]}.</h1>
                    <p className="text-muted-foreground text-xl">
                        Debo remembers your life so you can focus on living it.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/ask">
                        <Button variant="outline" className="h-12 rounded-2xl px-6 gap-2 border-2 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all">
                            <Search className="h-4 w-4" />
                            Ask your past
                        </Button>
                    </Link>
                    <Link href="/dashboard/journal/new">
                        <Button className="h-12 rounded-2xl px-8 gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                            <Plus className="h-4 w-4" />
                            New Entry
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Daily Insights Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
                    <Sparkles className="h-4 w-4" />
                    Life Insights
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    <InsightCard 
                        title="Focus Pattern"
                        content="You've mentioned 'Product Design' 5 times this week. It seems to be your primary focus."
                        icon={<Brain className="h-5 w-5 text-primary" />}
                    />
                    <InsightCard 
                        title="Emotional Trend"
                        content="Your entries show a 15% increase in positive sentiment compared to last month."
                        icon={<Sparkles className="h-5 w-5 text-amber-500" />}
                    />
                    <InsightCard 
                        title="Daily Streak"
                        content="You have recorded your thoughts for 5 days in a row. Keep the momentum going."
                        icon={<Plus className="h-5 w-5 text-emerald-500" />}
                    />
                </div>
            </section>

            {/* Recent Timeline */}
            <section className="space-y-6 pb-20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        Recent Entries
                    </div>
                    <Link href="/dashboard/journals" className="text-sm font-medium text-primary hover:underline">
                        View all entries →
                    </Link>
                </div>
                <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                    <JournalTimeline journals={journals.slice(0, 4)} />
                </div>
            </section>
        </div>
    );
}

function InsightCard({ title, content, icon }: { title: string, content: string, icon: React.ReactNode }) {
    return (
        <Card className="border-none bg-muted/30 rounded-3xl shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold uppercase tracking-tight text-muted-foreground">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <p className="text-lg font-medium leading-relaxed">{content}</p>
            </CardContent>
        </Card>
    );
}
