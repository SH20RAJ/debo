"use client";

import {
  User,
  CheckSquare,
  Brain,
  FileText,
  Clock,
  Hash,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";
import type { JournalEntry } from "./journal-page";

interface JournalInsightRailProps {
  entry: JournalEntry;
}

const MOCK_MEMORIES = [
  {
    id: "m1",
    title: "Marketing Sync Notes",
    type: "voice",
    date: "May 16",
    snippet: "Discussed Q4 allocation and product positioning...",
  },
  {
    id: "m2",
    title: "Competitive Analysis Draft",
    type: "file",
    date: "May 14",
    snippet: "Top 3 competitors and their feature gaps...",
  },
];

export function JournalInsightRail({ entry }: JournalInsightRailProps) {
  const wordCount = entry.content
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="p-4 space-y-5">
      {/* Detected People */}
      <InsightSection
        icon={User}
        title="Detected people"
        count={entry.people.length}
      >
        {entry.people.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {entry.people.map((person) => (
              <div key={person} className="flex items-center gap-1.5">
                <Avatar className="w-5 h-5">
                  <AvatarFallback className="text-[9px] bg-secondary text-foreground">
                    {getInitials(person)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-foreground">
                  {person}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No people detected
          </p>
        )}
      </InsightSection>

      <Separator />

      {/* Detected Tasks */}
      <InsightSection
        icon={CheckSquare}
        title="Detected tasks"
        count={entry.tasks.length}
      >
        {entry.tasks.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {entry.tasks.map((task, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-xs font-normal"
              >
                {task}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No tasks detected
          </p>
        )}
      </InsightSection>

      <Separator />

      {/* Related Memories */}
      <InsightSection icon={Brain} title="Related memories">
        <div className="space-y-2">
          {MOCK_MEMORIES.map((memory) => (
            <Card
              key={memory.id}
              className="cursor-pointer hover:border-primary/20 transition-colors"
            >
              <CardContent className="p-2.5 space-y-1">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium text-foreground truncate">
                    {memory.title}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  {memory.snippet}
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  {memory.type} &middot; {memory.date}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </InsightSection>

      <Separator />

      {/* Writing Stats */}
      <InsightSection icon={Hash} title="Writing stats">
        <div className="space-y-2">
          <StatRow icon={FileText} label="Words" value={wordCount} />
          <StatRow
            icon={Clock}
            label="Reading time"
            value={`${readingTime} min`}
          />
        </div>
      </InsightSection>
    </div>
  );
}

function InsightSection({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          {title}
        </h3>
        {count !== undefined && count > 0 && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
            {count}
          </Badge>
        )}
      </div>
      {children}
    </div>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </div>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}
