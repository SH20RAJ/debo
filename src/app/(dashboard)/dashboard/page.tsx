import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getJournals } from "./actions";
import { JournalTimeline } from "@/components/dashboard/journal-timeline";

export default async function DashboardPage() {
  const journals = await getJournals();

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-4 md:px-10 md:py-8 space-y-12 pb-20 animate-in fade-in duration-500">
      <div className="flex items-end justify-between border-b pb-6 border-border/40">
        <div className="space-y-1">
          <h1 className="text-4xl font-semibold tracking-tight">Journal</h1>
          <p className="text-muted-foreground text-lg">Your repository of thoughts and experiences.</p>
        </div>
        <Link href="/dashboard/journal/new">
          <Button size="lg" className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
            <PlusCircle className="mr-2 h-5 w-5" />
            New Entry
          </Button>
        </Link>
      </div>

      <div className="animate-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
        <JournalTimeline journals={journals} />
      </div>
    </div>
  );
}
