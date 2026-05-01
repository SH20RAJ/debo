import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";

import { Metadata } from "next";

import { LifeTimeline } from "@/components/dashboard/life/life-timeline";
import { Button } from "@/components/ui/button";
import { getLifeTimeline, type TimelineGrouping } from "@/lib/life/timeline";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:px-8">
        <header className="space-y-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Chronology
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight">
                Your life, arranged by time
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Debo turns journals into a structured sequence of days, weeks,
                and months.
              </p>
            </div>
            <div className="flex items-center rounded-xl glass p-1">
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
      size="sm"
      className={cn(
        "rounded-lg px-4 text-xs font-medium transition-all",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
      )}
    >
      <Link href={`/dashboard/timeline?group=${value}`}>{value}</Link>
    </Button>
  );
}
