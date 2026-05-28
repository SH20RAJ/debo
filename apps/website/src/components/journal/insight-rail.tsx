"use client";

import { useEffect, useState } from "react";
import {
  User,
  CheckSquare,
  Brain,
  FileText,
  Clock,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { api } from "@/lib/api";
import type { JournalEntry } from "./journal-page";

interface RelatedMemory {
  id: string;
  title: string;
  type: string;
  date: string;
  snippet: string;
}

interface JournalInsightRailProps {
  entry: JournalEntry;
}

export function JournalInsightRail({ entry }: JournalInsightRailProps) {
  const [relatedMemories, setRelatedMemories] = useState<RelatedMemory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.sources.list()
      .then((data: any) => {
        const allSources: any[] = data ?? [];
        // Show recent sources as related
        const recent = allSources.slice(0, 3).map((s: any) => ({
          id: s.id,
          title: s.title || "Untitled",
          type: s.type || "source",
          date: s.createdAt
            ? new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "",
          snippet: s.description || s.plainText?.slice(0, 80) || "",
        }));
        setRelatedMemories(recent);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [entry.id]);

  const wordCount = entry.content
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const hasPeople = entry.people.length > 0;
  const hasTasks = entry.tasks.length > 0;

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Insights
      </h3>

      {/* People — only show if detected */}
      {hasPeople && (
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">People</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {entry.people.map((person) => (
              <div key={person} className="flex items-center gap-1.5">
                <Avatar className="w-5 h-5">
                  <AvatarFallback className="text-[9px] bg-secondary text-foreground">
                    {getInitials(person)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-foreground">{person}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tasks — only show if detected */}
      {hasTasks && (
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <CheckSquare className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Tasks</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {entry.tasks.map((task, i) => (
              <Badge key={i} variant="secondary" className="text-xs font-normal">
                {task}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Related Memories */}
      <section>
        <div className="flex items-center gap-1.5 mb-2">
          <Brain className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Related</span>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading...
          </div>
        ) : (
          <div className="space-y-2">
            {relatedMemories.map((memory) => (
              <button
                key={memory.id}
                className="w-full text-left p-2.5 rounded-md border border-border/50 hover:border-border hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium text-foreground truncate">
                    {memory.title}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                  {memory.snippet}
                </p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">
                  {memory.type} · {memory.date}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Stats — compact */}
      <section className="pt-2 border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3 h-3" />
            <span>{wordCount} words</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>{readingTime} min</span>
          </div>
        </div>
      </section>
    </div>
  );
}
