import Link from "next/link";
import { format } from "date-fns";
import { CalendarClock, ChevronRight, Sparkles } from "lucide-react";

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
      <div className="rounded-3xl border-2 border-dashed border-duo-swan bg-duo-polar px-6 py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white border-2 border-duo-swan text-duo-swan mb-6 animate-bounce-subtle">
          <CalendarClock className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-heading font-black text-duo-eel uppercase tracking-wider">No timeline yet</h3>
        <p className="mx-auto max-w-md text-lg font-bold text-duo-wolf mt-2">
          Add a few journal entries and Debo will turn them into a structured life timeline.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-12">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-duo-polar border-2 border-duo-swan text-duo-blue">
          <Sparkles className="h-6 w-6 animate-bounce-subtle" />
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-duo-swan">
            Temporal Sequence
          </div>
          <h2 className="text-2xl font-heading font-black text-duo-eel uppercase tracking-wider">{title}</h2>
        </div>
      </div>

      <div className="relative space-y-10 border-l-4 border-duo-swan pl-12 ml-6">
        {entries.map((entry) => (
          <details key={`${entry.grouping}-${entry.date}`} className="group relative">
            <summary className="list-none cursor-pointer">
              <div className="absolute -left-[54px] top-8 flex h-4 w-4 items-center justify-center rounded-full border-2 border-duo-swan bg-white transition-all group-hover:border-duo-macaw group-open:border-duo-macaw group-open:bg-duo-macaw" />

              <div className="duo-card hover-bounce p-0 overflow-hidden">
                <div className="p-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="rounded-xl border-2 border-duo-swan bg-duo-polar px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-duo-wolf">
                        {entry.grouping}
                      </div>
                      <span className="text-xs font-black text-duo-swan uppercase tracking-widest">{entry.label}</span>
                    </div>
                    <h3 className="text-2xl font-heading font-black text-duo-eel transition-colors group-hover:text-duo-blue">
                      {entry.summary}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-duo-swan">
                    <CalendarClock className="h-4 w-4 text-duo-blue" />
                    {format(new Date(`${entry.date}T00:00:00.000Z`), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
            </summary>

            <div className="mt-6 overflow-hidden rounded-3xl border-2 border-duo-swan bg-duo-polar p-8 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="space-y-10">
                <div className="grid gap-10 md:grid-cols-3">
                  <TimelineList label="Key Events" items={entry.events} tone="blue" />
                  <TimelineList label="Emotional Tone" items={entry.emotions} tone="purple" />
                  <TimelineList label="Thematic Focus" items={entry.topics} tone="green" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border-2 border-duo-swan bg-white p-6">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-duo-swan">Source Evidence</div>
                    <div className="text-sm font-bold text-duo-wolf">Linked to {entry.journalIds.length} recorded moments</div>
                  </div>

                  {entry.journalIds.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {entry.journalIds.slice(0, 3).map((id) => (
                        <Link
                          key={id}
                          href={`/dashboard/journal/${id}`}
                          className="btn-3d btn-3d-white inline-flex items-center gap-2 rounded-2xl border-2 border-duo-swan bg-white px-5 py-2 text-xs font-black uppercase tracking-wider transition-all hover:bg-duo-polar"
                        >
                          Open Journal
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
    blue: "bg-duo-blue/10 text-duo-blue border-duo-macaw/30",
    purple: "bg-duo-purple/10 text-duo-purple border-duo-beetle/30",
    green: "bg-duo-green/10 text-duo-green border-duo-feather/30",
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-duo-swan">{label}</h4>
      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item} className={`rounded-xl border-2 px-4 py-1.5 text-xs font-black uppercase tracking-wider ${toneClasses[tone]}`}>
              {item}
            </div>
          ))
        ) : (
          <span className="text-xs font-bold text-duo-swan italic">No strong signals yet.</span>
        )}
      </div>
    </div>
  );
}