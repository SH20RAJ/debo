import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getJournals } from "./actions";
import { JournalTimeline } from "@/components/dashboard/journal-timeline";

export default async function DashboardPage() {
  const journals = await getJournals();

  return (
    <div className="space-y-12 pb-10">
      <div className="flex items-end justify-between border-b pb-6 border-border/40">
        <div className="space-y-1">
          <h1 className="text-4xl font-semibold tracking-tight tracking-tighter">Journal</h1>
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
