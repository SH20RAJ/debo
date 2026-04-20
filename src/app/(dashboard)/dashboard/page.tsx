import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getJournals } from "./actions";
import { JournalTimeline } from "@/components/dashboard/journal-timeline";

export default async function DashboardPage() {
  const journals = await getJournals();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Journals</h1>
          <p className="text-muted-foreground">Write your thoughts and let AI understand you.</p>
        </div>
        <Link href="/dashboard/journal/new">
          <Button size="lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            New Entry
          </Button>
        </Link>
      </div>

      <JournalTimeline journals={journals} />
    </div>
  );
}
