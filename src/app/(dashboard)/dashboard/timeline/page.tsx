import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LifeTimeline } from "@/components/dashboard/life/life-timeline";
import { Button } from "@/components/ui/button";
import { getLifeTimeline, type TimelineGrouping } from "@/lib/life/timeline";
import Link from "next/link";

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/join");

  const params = await searchParams;
  const grouping = normalizeGrouping(params.group);
  const timeline = await getLifeTimeline(session.user.id, grouping);

  return (
    <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(233,196,106,0.14),_transparent_28%),linear-gradient(180deg,_rgba(248,250,252,0.92),_rgba(241,245,249,0.72))] dark:bg-[radial-gradient(circle_at_top_right,_rgba(233,196,106,0.08),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,0.92))]">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 lg:px-8">
        <section className="space-y-4 rounded-[2rem] border border-border/70 bg-card/80 p-8 shadow-xl shadow-black/5 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            Timeline
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight">Your life, arranged by time</h1>
              <p className="max-w-2xl text-muted-foreground">
                Debo turns journals into a structured sequence of days, weeks, and months so patterns are easier to see.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <GroupingButton current={grouping} value="daily" />
              <GroupingButton current={grouping} value="weekly" />
              <GroupingButton current={grouping} value="monthly" />
            </div>
          </div>
        </section>

        <LifeTimeline entries={timeline} title={`${grouping[0].toUpperCase()}${grouping.slice(1)} timeline`} />
      </div>
    </div>
  );
}

function normalizeGrouping(value?: string): TimelineGrouping {
  if (value === "weekly" || value === "monthly") {
    return value;
  }

  return "daily";
}

function GroupingButton({ current, value }: { current: TimelineGrouping; value: TimelineGrouping }) {
  return (
    <Button asChild variant={current === value ? "default" : "outline"} className="rounded-full px-4">
      <Link href={`/dashboard/timeline?group=${value}`}>{value}</Link>
    </Button>
  );
}