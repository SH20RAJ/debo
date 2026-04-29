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
      <Card className="border border-dashed border-border/70 bg-card/70 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarClock className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">No timeline yet</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Add a few journal entries and Debo will turn them into a structured life timeline.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
            Temporal Sequence
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        </div>
      </div>

      <div className="relative space-y-6 border-l-2 border-primary/20 pl-8 ml-4 before:absolute before:left-[-2px] before:top-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-primary/40 before:via-primary/10 before:to-transparent">
        {entries.map((entry) => (
          <details key={`${entry.grouping}-${entry.date}`} className="group relative">
            <summary className="list-none cursor-pointer">
              <div className="absolute -left-[41px] top-6 flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary/30 bg-background transition-all duration-500 group-hover:border-primary/60 group-hover:shadow-[0_0_15px_rgba(var(--primary),0.3)] group-open:border-primary group-open:bg-primary group-open:text-primary-foreground">
                <div className="h-2 w-2 rounded-full bg-primary/60 group-open:bg-primary-foreground transition-all duration-500 group-open:scale-150 group-hover:bg-primary" />
              </div>

              <Card className="rounded-[2rem] border-border/50 bg-card/40 backdrop-blur-md transition-all hover:bg-card/60 hover:shadow-xl hover:shadow-primary/5 group-open:bg-card/80">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 px-4 py-1 text-primary">
                          {entry.grouping}
                        </Badge>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">{entry.label}</span>
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {entry.summary}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 bg-muted/30 px-3 py-1.5 rounded-full">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {format(new Date(`${entry.date}T00:00:00.000Z`), "MMM d, yyyy")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </summary>

            <Card className="mt-4 overflow-hidden border-border/40 bg-muted/10 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <CardHeader className="pb-4 pt-6 border-b border-border/10 px-8">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                  Detailed Memory Analysis
                </div>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                <div className="grid gap-6 md:grid-cols-3">
                  <TimelineList label="Key Events" items={entry.events} tone="primary" />
                  <TimelineList label="Emotional Tone" items={entry.emotions} tone="amber" />
                  <TimelineList label="Thematic Focus" items={entry.topics} tone="emerald" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/10 bg-background/40 p-6">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">Source Evidence</div>
                    <div className="text-sm font-medium">Linked to {entry.journalIds.length} recorded moments</div>
                  </div>
                  
                  {entry.journalIds.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {entry.journalIds.slice(0, 3).map((id) => (
                        <Link
                          key={id}
                          href={`/dashboard/journal/${id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-background/50 px-4 py-2 text-xs font-bold transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm"
                        >
                          OPEN JOURNAL
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
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
    primary: "bg-primary/10 text-primary border-primary/20",
    amber: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">{label}</h4>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <Badge key={item} variant="outline" className={`rounded-full px-3 py-1 ${toneClasses[tone]}`}>
              {item}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">No strong signals yet.</span>
        )}
      </div>
    </div>
  );
}