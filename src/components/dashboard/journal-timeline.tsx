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
      <div className="border border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4 mt-8">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <CalendarIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">No entries yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Get started by writing your first journal entry. Over time, Debo will build an intelligent context window around you.
        </p>
      </div>
    );
  }

  return (
    <div className="relative border-l border-muted ml-3 space-y-8 pb-10 mt-8">
      {journals.map((journal) => (
        <div key={journal.id} className="relative pl-8 group">
          {/* Timeline Dot */}
          <div className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />

          {/* Date Label */}
          <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {format(new Date(journal.createdAt), "MMMM d, yyyy • h:mm a")}
          </div>

          {/* Entry Card */}
          <Link href={`/dashboard/journal/${journal.id}`}>
            <div className="group border rounded-xl p-5 bg-card/50 hover:bg-card hover:shadow-sm transition-all duration-200 block cursor-pointer">
              <div className="prose prose-neutral dark:prose-invert max-w-none line-clamp-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {journal.content}
                </ReactMarkdown>
              </div>
              <div className="mt-4 flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Read full entry <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
