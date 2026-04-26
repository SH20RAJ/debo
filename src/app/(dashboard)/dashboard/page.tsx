import { Activity, Sparkles, Database } from "lucide-react";
import { getJournals } from "./actions";
import { JournalTimeline } from "@/components/dashboard/journal/journal-timeline";
import { Card, CardContent } from "@/components/ui/card";
import { LiveKitVoiceAgent } from "@/components/dashboard/overview/livekit-voice";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-12 space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Bento Grid Stats */}
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Voice Agent Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          Voice Companion
          <div className="h-px bg-border/20 flex-1 ml-4" />
        </h2>
        <div className="max-w-3xl">
          <LiveKitVoiceAgent />
        </div>
      </div>

      {/* Timeline Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          Your Timeline
          <div className="h-px bg-border/20 flex-1 ml-4" />
        </h2>
        <Suspense fallback={<TimelineSkeleton />}>
            <DashboardTimeline />
        </Suspense>
      </div>

    </div>
  );
}

async function DashboardStats() {
    const journals = await getJournals();
    const totalEntries = journals.length;
    const recentEntries = journals.filter(j => 
        new Date(j.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none bg-muted/50">
                <CardContent className="p-8 flex flex-col justify-between h-full space-y-6">
                    <div className="p-3 bg-background w-fit rounded-2xl shadow-sm">
                        <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-5xl font-bold tracking-tighter">{totalEntries}</p>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Total Memories</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none bg-muted/50">
                <CardContent className="p-8 flex flex-col justify-between h-full space-y-6">
                    <div className="p-3 bg-background w-fit rounded-2xl shadow-sm">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-5xl font-bold tracking-tighter">{recentEntries}</p>
                        <p className="text-sm text-muted-foreground font-medium mt-1">New This Week</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none bg-muted/50">
                <CardContent className="p-8 flex flex-col justify-between h-full space-y-6">
                    <div className="p-3 bg-background w-fit rounded-2xl shadow-sm">
                        <Database className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-5xl font-bold tracking-tighter">Live</p>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Sync Status</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

async function DashboardTimeline() {
    const journals = await getJournals();
    return <JournalTimeline journals={journals} />;
}

function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="border-none bg-muted/50">
                    <CardContent className="p-8 space-y-6">
                        <Skeleton className="h-12 w-12 rounded-2xl bg-background" />
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-20" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function TimelineSkeleton() {
    return (
        <div className="space-y-8 pl-4 border-l-2 border-border/40 ml-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="relative pl-10 space-y-4">
                    <div className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full bg-muted" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
            ))}
        </div>
    );
}
