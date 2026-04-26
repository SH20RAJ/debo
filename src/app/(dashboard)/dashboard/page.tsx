import { Button } from "@/components/ui/button";
import { PlusCircle, Activity, Sparkles, Database } from "lucide-react";
import Link from "next/link";
import { getJournals } from "./actions";
import { JournalTimeline } from "@/components/dashboard/journal/journal-timeline";
import { Card, CardContent } from "@/components/ui/card";
import { LiveKitVoiceAgent } from "@/components/dashboard/overview/livekit-voice";

export default async function DashboardPage() {
  const journals = await getJournals();
  
  // Calculate some dummy or real stats
  const totalEntries = journals.length;
  const recentEntries = journals.filter(j => 
    new Date(j.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-12 space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Stat Card 1 */}
        <Card className="border-none bg-muted/50">
          <CardContent className="p-8 flex flex-col justify-between h-full space-y-6">
            <div className="p-3 bg-background w-fit rounded-2xl shadow-sm">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-5xl font-bold tracking-tighter">{totalEntries}</p>
              <p className="text-sm text-muted-foreground font-medium mt-1">Total Journal Entries</p>
            </div>
          </CardContent>
        </Card>

        {/* Stat Card 2 */}
        <Card className="border-none bg-muted/50">
          <CardContent className="p-8 flex flex-col justify-between h-full space-y-6">
            <div className="p-3 bg-background w-fit rounded-2xl shadow-sm">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-5xl font-bold tracking-tighter">{recentEntries}</p>
              <p className="text-sm text-muted-foreground font-medium mt-1">Entries This Week</p>
            </div>
          </CardContent>
        </Card>

        {/* Stat Card 3 */}
        <Card className="border-none bg-muted/50">
          <CardContent className="p-8 flex flex-col justify-between h-full space-y-6">
            <div className="p-3 bg-background w-fit rounded-2xl shadow-sm">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-5xl font-bold tracking-tighter">Synced</p>
              <p className="text-sm text-muted-foreground font-medium mt-1">Vector DB Status</p>
            </div>
          </CardContent>
        </Card>

      </div>

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
          Timeline
          <div className="h-px bg-border/20 flex-1 ml-4" />
        </h2>
        <JournalTimeline journals={journals} />
      </div>

    </div>
  );
}
