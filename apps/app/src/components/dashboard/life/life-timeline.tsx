import Link from "next/link";
import { format } from "date-fns";
import { CalendarClock, ChevronRight, Sparkles } from "lucide-react";

import type { LifeTimelineEntry } from "@debo/memory/life/timeline";

export function LifeTimeline({
  entries,
  title = "Life Timeline",
}: {
  entries: LifeTimelineEntry[];
  title?: string;
}) {
  if (!entries.length) {
    return (
      <div className="rounded-3xl border border-dashed border-border/50 bg-muted/5 px-6 py-24 text-center animate-in fade-in zoom-in duration-500">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-card border border-border/50 text-muted-foreground/20 mb-8 animate-bounce-subtle">
          <CalendarClock className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-heading font-semibold text-foreground tracking-tight">Timeline Initialization</h3>
        <p className="mx-auto max-w-sm text-sm font-medium text-muted-foreground/40 mt-3 italic leading-relaxed">
          Record more moments in your journal to enable chronological context extraction and pattern mapping.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-12">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30">
            Temporal Intelligence
          </div>
          <h2 className="text-2xl font-heading font-semibold text-foreground tracking-tight">{title}</h2>
        </div>
      </div>

      <div className="relative space-y-12 border-l border-border/50 pl-12 ml-6">
        {entries.map((entry) => (
          <details key={`${entry.grouping}-${entry.date}`} className="group relative">
            <summary className="list-none cursor-pointer">
              <div className="absolute -left-[53px] top-8 flex h-2.5 w-2.5 items-center justify-center rounded-full border border-border/50 bg-card transition-all group-hover:border-primary/40 group-open:border-primary group-open:bg-primary" />

              <div className="minimal-card p-0 overflow-hidden bg-card/40 border border-border/50 hover:bg-card/60 transition-all hover:shadow-xl hover:shadow-primary/5">
                <div className="p-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="rounded-lg bg-primary/5 border border-primary/10 px-4 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-primary/60">
                        {entry.grouping}
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">{entry.label}</span>
                    </div>
                    <h3 className="text-2xl font-heading font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors">
                      {entry.summary}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
                    <CalendarClock className="h-4 w-4 text-primary/40" />
                    {format(new Date(`${entry.date}T00:00:00.000Z`), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
            </summary>

            <div className="mt-8 overflow-hidden rounded-2xl border border-border/40 bg-muted/5 p-10 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="space-y-12">
                <div className="grid gap-12 md:grid-cols-3">
                  <TimelineList label="Key Events" items={entry.events} tone="blue" />
                  <TimelineList label="Emotional Tone" items={entry.emotions} tone="purple" />
                  <TimelineList label="Thematic Focus" items={entry.topics} tone="green" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-8 rounded-xl border border-border/30 bg-card/40 p-8">
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/20">Source Graph Nodes</div>
                    <div className="text-sm font-semibold text-foreground/60">{entry.journalIds.length} verified connections found</div>
                  </div>

                  {entry.journalIds.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                      {entry.journalIds.slice(0, 3).map((id) => (
                        <Link
                          key={id}
                          href={`/dashboard/journal/${id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-background/50 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all"
                        >
                          Access Moment
                          <ChevronRight className="h-4 w-4" />
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
  tone: "blue" | "purple" | "green";
}) {
  const toneClasses = {
    blue: "bg-primary/5 text-primary/80 border-primary/20",
    purple: "bg-primary/10 text-primary border-primary/30",
    green: "bg-primary/5 text-primary/60 border-primary/10",
  };

  return (
    <div className="space-y-6">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/20">{label}</h4>
      <div className="flex flex-wrap gap-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item} className={`rounded-xl border px-5 py-2 text-[11px] font-semibold tracking-tight transition-all hover:bg-background ${toneClasses[tone]}`}>
              {item}
            </div>
          ))
        ) : (
          <span className="text-xs font-medium text-muted-foreground/30 italic">No signals detected.</span>
        )}
      </div>
    </div>
  );
}