import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";

import { Metadata } from "next";

import { LifeTimeline } from "@/components/dashboard/life/life-timeline";
import { Button } from "@/components/ui/button";
import { getLifeTimeline, type TimelineGrouping } from "@/lib/life/timeline";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const user = await stackServerApp.getUser();
  if (!user) redirect("/join");

  const params = await searchParams;
  const grouping = normalizeGrouping(params.group);
  const timeline = await getLifeTimeline(user.id, grouping);

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="space-y-6">
          <div className="inline-flex items-center gap-2 self-start rounded-xl border-2 border-duo-swan bg-duo-polar px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-duo-wolf">
            <Sparkles className="h-4 w-4 text-duo-purple animate-bounce-subtle" />
            TIMELINE
          </div>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-heading font-black tracking-tight text-duo-eel md:text-5xl lg:text-6xl leading-[1.1]">
                Your life, <br />
                <span className="text-duo-swan">by time.</span>
              </h1>
              <p className="max-w-2xl text-xl font-bold text-duo-wolf">
                Debo organizes your notes by day, week, and month.
              </p>
            </div>
            <div className="flex items-center rounded-2xl border-2 border-duo-swan p-1 bg-duo-polar self-start lg:self-end">
              <GroupingButton current={grouping} value="daily" />
              <GroupingButton current={grouping} value="weekly" />
              <GroupingButton current={grouping} value="monthly" />
            </div>
          </div>
        </header>

        <LifeTimeline
          entries={timeline}
          title={`${grouping[0].toUpperCase()}${grouping.slice(1)} timeline`}
        />
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Timeline",
  description:
    "View your journal entries organized by day, week, or month to surface patterns over time.",
};

function normalizeGrouping(value?: string): TimelineGrouping {
  if (value === "weekly" || value === "monthly") {
    return value;
  }

  return "daily";
}

function GroupingButton({
  current,
  value,
}: {
  current: TimelineGrouping;
  value: TimelineGrouping;
}) {
  const isActive = current === value;
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "rounded-xl px-6 h-10 text-xs font-black uppercase tracking-wider transition-all",
        isActive
          ? "bg-background text-duo-blue shadow-[0_2px_0_var(--duo-swan)] border-2 border-duo-swan"
          : "text-duo-swan hover:text-duo-wolf",
      )}
    >
      <Link href={`/dashboard/timeline?group=${value}`}>{value}</Link>
    </Button>
  );
}
