import Link from "next/link";
import { format } from "date-fns";
import { CalendarClock, ChevronRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LifeTimelineEntry } from "@/lib/life/timeline";

export function LifeTimeline({
  entries,
  title = "Life Timeline",
}: {
  entries: LifeTimelineEntry[];
  title?: string;
}) {
  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-background border border-border text-muted-foreground mb-4">
          <CalendarClock className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight">No timeline yet</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Add a few journal entries and Debo will turn them into a structured life timeline.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Temporal Sequence
          </div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        </div>
      </div>

      <div className="relative space-y-8 border-l border-border pl-10 ml-5">
        {entries.map((entry) => (
          <details key={`${entry.grouping}-${entry.date}`} className="group relative">
            <summary className="list-none cursor-pointer">
              <div className="absolute -left-[45px] top-6 flex h-3 w-3 items-center justify-center rounded-full border border-border bg-background transition-all group-hover:border-primary group-open:border-primary group-open:bg-primary" />

              <div className="rounded-2xl glass-card p-6 transition-all group-open:bg-muted/10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="rounded-full border border-border bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {entry.grouping}
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground/40">{entry.label}</span>
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                      {entry.summary}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {format(new Date(`${entry.date}T00:00:00.000Z`), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
            </summary>

            <div className="mt-4 overflow-hidden rounded-2xl glass p-6 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="space-y-8">
                <div className="grid gap-8 md:grid-cols-3">
                  <TimelineList label="Key Events" items={entry.events} tone="primary" />
                  <TimelineList label="Emotional Tone" items={entry.emotions} tone="amber" />
                  <TimelineList label="Thematic Focus" items={entry.topics} tone="emerald" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl glass p-5">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Source Evidence</div>
                    <div className="text-xs font-medium text-muted-foreground">Linked to {entry.journalIds.length} recorded moments</div>
                  </div>

                  {entry.journalIds.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {entry.journalIds.slice(0, 3).map((id) => (
                        <Link
                          key={id}
                          href={`/dashboard/journal/${id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm"
                        >
                          Open Journal
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function TimelineList({
  label,
  items,
  tone,
}: {
  label: string;
  items: string[];
  tone: "primary" | "amber" | "emerald";
}) {
  const toneClasses = {
    primary: "bg-primary/5 text-primary border-primary/20",
    amber: "bg-amber-500/5 text-amber-700 border-amber-500/20",
    emerald: "bg-emerald-500/5 text-emerald-700 border-emerald-500/20",
  };

  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</h4>
      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item} className={`rounded-lg border px-3 py-1 text-[11px] font-medium ${toneClasses[tone]}`}>
              {item}
            </div>
          ))
        ) : (
          <span className="text-[11px] text-muted-foreground italic">No strong signals yet.</span>
        )}
      </div>
    </div>
  );
}