"use client";

import { ExternalLink } from "lucide-react";

interface CitationCardProps {
  source: {
    id: string;
    content: string;
    date?: string | Date;
    title?: string;
  };
}

export function CitationCard({ source }: CitationCardProps) {
  const dateStr = source.date 
    ? new Date(source.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : "Memory";

  return (
    <div className="group relative flex flex-col gap-1 p-3 rounded-xl border border-border/50 bg-background hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-muted-foreground uppercase">{dateStr}</span>
        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-xs text-foreground line-clamp-2 italic leading-relaxed">
        &quot;{source.content}&quot;
      </p>
      {source.title && (
        <span className="text-[10px] text-muted-foreground font-medium truncate mt-1">
          {source.title}
        </span>
      )}
    </div>
  );
}
