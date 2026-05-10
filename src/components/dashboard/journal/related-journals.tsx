"use client";

import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Sparkles } from "lucide-react";

interface RelatedJournalProps {
  id: string;
  title?: string | null;
  content: string;
  createdAt: string | Date;
  tags?: string[] | null;
}

export function RelatedJournals({ journals }: { journals: RelatedJournalProps[] }) {
  if (journals.length === 0) return null;

  return (
    <div className="mt-20 border-t-2 border-duo-swan/20 pt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="h-10 w-10 rounded-2xl bg-duo-macaw/10 flex items-center justify-center text-duo-macaw">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-duo-eel lowercase tracking-tight">similar moments</h2>
          <p className="text-sm font-bold text-duo-swan uppercase tracking-widest">discovered in your past</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {journals.map((journal) => (
          <RelatedJournalCard key={journal.id} journal={journal} />
        ))}
      </div>
    </div>
  );
}

function RelatedJournalCard({ journal }: { journal: RelatedJournalProps }) {
  const preview = journal.content.slice(0, 140).replace(/[#*`]/g, "");

  return (
    <Link 
      href={`/dashboard/journal/${journal.id}`}
      className="group flex flex-col rounded-[2rem] border-4 border-duo-swan/30 bg-white p-6 transition-all duration-300 hover:border-duo-macaw/50 hover:-translate-y-2 hover:shadow-[0_12px_0_var(--duo-macaw-shadow)] active:translate-y-1 active:shadow-none"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-duo-swan">
          <span>{format(new Date(journal.createdAt), "MMM d, yyyy")}</span>
        </div>

        <div className="space-y-2">
          {journal.title && (
            <h3 className="text-lg font-black tracking-tight text-duo-eel line-clamp-1 group-hover:text-duo-macaw transition-colors lowercase">
              {journal.title}
            </h3>
          )}
          <p className="text-sm font-bold text-duo-wolf line-clamp-3 leading-relaxed">
            {preview}...
          </p>
        </div>

        {journal.tags && journal.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {journal.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-duo-macaw/70 bg-duo-macaw/5 px-2 py-1 rounded-lg border border-duo-macaw/10">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
