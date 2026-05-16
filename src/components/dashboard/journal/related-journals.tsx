"use client";

import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Sparkles } from "lucide-react";

interface RelatedJournalProps {
  id: string;
  type?: "text" | "video" | "audio";
  title?: string | null;
  content?: string;
  transcript?: string | null;
  createdAt: string | Date;
  tags?: string[] | null;
}

export function RelatedJournals({ journals }: { journals: RelatedJournalProps[] }) {
  if (journals.length === 0) return null;

  return (
    <div className="mt-20 border-t-2 border-border pt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Similar moments</h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Discovered in your past</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {journals.map((journal) => (
          <RelatedJournalCard key={journal.id} journal={journal} />
        ))}
      </div>
    </div>
  );
}

function RelatedJournalCard({ journal }: { journal: RelatedJournalProps }) {
  const content = journal.content || journal.transcript || "";
  const preview = content.slice(0, 140).replace(/[#*`]/g, "");
  const type = journal.type || "text";

  return (
    <Link
      href={`/dashboard/journal/${journal.id}?type=${type}`}
      className="group flex flex-col rounded-2xl border-2 border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-[0_2px_0_var(--primary)]"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          <span>{format(new Date(journal.createdAt), "MMM d, yyyy")}</span>
          {journal.type && journal.type !== "text" && (
            <span className="text-primary font-bold ml-auto">{journal.type}</span>
          )}
        </div>

        <div className="space-y-2">
          {journal.title && (
            <h3 className="text-lg font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {journal.title}
            </h3>
          )}
          <p className="text-sm font-medium text-muted-foreground line-clamp-3 leading-relaxed">
            {preview || (type === "video" ? "Processing video..." : type === "audio" ? "Processing audio..." : "No content")}{preview ? "..." : ""}
          </p>
        </div>

        {journal.tags && journal.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {journal.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded-lg border-2 border-primary/10">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
