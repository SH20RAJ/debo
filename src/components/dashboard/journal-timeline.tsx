"use client";

import Link from "next/link";
import { format } from "date-fns";
import { CalendarIcon, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type JournalProps = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  vectorizeId: string | null;
};

export function JournalTimeline({ journals }: { journals: JournalProps[] }) {
  if (!journals || journals.length === 0) {
    return (
      <div className="border border-dashed border-border/20 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4 mt-8 bg-background/20 backdrop-blur-md">
        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 ring-8 ring-background/50">
          <CalendarIcon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight">No entries yet</h3>
        <p className="text-muted-foreground text-lg max-w-md">
          Get started by writing your first journal entry. Over time, Debo will build an intelligent context window around you.
        </p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-border/40 ml-4 space-y-12 pb-10 mt-10">
      {journals.map((journal) => (
        <div key={journal.id} className="relative pl-10 group">
          {/* Timeline Dot */}
          <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-background border-2 border-primary group-hover:scale-125 transition-transform duration-300" />

          {/* Date Label */}
          <div className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-3 group-hover:text-foreground transition-colors duration-300">
            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold">
              {format(new Date(journal.createdAt), "EEE")}
            </span>
            {format(new Date(journal.createdAt), "MMMM d, yyyy • h:mm a")}
          </div>

          {/* Entry Card */}
          <Link href={`/dashboard/journal/${journal.id}`}>
            <div className="group border border-border/10 rounded-3xl p-6 bg-background/40 backdrop-blur-xl hover:bg-background/60 hover:border-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 block cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="prose prose-neutral dark:prose-invert max-w-none line-clamp-3 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {journal.content}
                </ReactMarkdown>
              </div>
              <div className="mt-6 flex items-center text-xs text-primary font-semibold tracking-wider uppercase opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                View Details <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
