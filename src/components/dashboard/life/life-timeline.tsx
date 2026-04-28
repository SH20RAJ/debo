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
    <section className="space-y-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        {title}
      </div>

      <div className="relative space-y-4 border-l border-border/60 pl-6">
        {entries.map((entry) => (
          <details key={`${entry.grouping}-${entry.date}`} className="group relative">
            <summary className="list-none cursor-pointer rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="absolute -left-[25px] top-6 flex h-5 w-5 items-center justify-center rounded-full border border-primary/40 bg-background">
                <div className="h-2.5 w-2.5 rounded-full bg-primary transition-transform group-open:scale-125" />
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
                      {entry.grouping}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{entry.label}</span>
                  </div>
                  <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                    {entry.summary}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarClock className="h-4 w-4" />
                  {format(new Date(`${entry.date}T00:00:00.000Z`), "MMM d")}
                </div>
              </div>
            </summary>

            <Card className="mt-3 border-border/60 bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
                  Related signals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pb-6">
                <div className="grid gap-3 md:grid-cols-3">
                  <TimelineList label="Events" items={entry.events} tone="primary" />
                  <TimelineList label="Emotions" items={entry.emotions} tone="amber" />
                  <TimelineList label="Topics" items={entry.topics} tone="emerald" />
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/80 p-4 text-sm text-muted-foreground">
                  Journals linked: <span className="font-medium text-foreground">{entry.journalIds.length}</span>
                  {entry.journalIds.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.journalIds.slice(0, 3).map((id) => (
                        <Link
                          key={id}
                          href={`/dashboard/journal/${id}`}
                          className="inline-flex items-center gap-1 rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                        >
                          Open journal
                          <ChevronRight className="h-3 w-3" />
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