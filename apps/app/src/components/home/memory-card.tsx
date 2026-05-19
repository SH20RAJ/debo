"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { LucideIcon } from "lucide-react";
import { Mic, BookOpen, FileText } from "lucide-react";

export interface MemoryCardProps {
  sourceType: "voice" | "journal" | "file";
  title: string;
  summary: string;
  date: string;
  people?: string[];
  taskCount?: number;
}

const sourceIcons: Record<MemoryCardProps["sourceType"], LucideIcon> = {
  voice: Mic,
  journal: BookOpen,
  file: FileText,
};

const sourceLabels: Record<MemoryCardProps["sourceType"], string> = {
  voice: "Voice note",
  journal: "Journal",
  file: "PDF",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function MemoryCard({
  sourceType,
  title,
  summary,
  date,
  people,
  taskCount,
}: MemoryCardProps) {
  const Icon = sourceIcons[sourceType];
  const sourceLabel = sourceLabels[sourceType];

  return (
    <Card
      className={cn(
        "rounded-2xl border-2 border-border bg-card p-0",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30",
        "flex flex-col"
      )}
    >
      <CardContent className="flex flex-col gap-3 p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground">{sourceLabel}</p>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {summary}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-2 flex-wrap mt-auto pt-1">
          <span className="text-xs text-muted-foreground">{date}</span>
          {people && people.length > 0 && (
            <>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <TooltipProvider>
                <div className="flex items-center gap-1">
                  {people.map((person) => (
                    <Tooltip key={person}>
                      <TooltipTrigger asChild>
                        <Avatar size="sm" className="cursor-default">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                            {getInitials(person)}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{person}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </>
          )}
          {taskCount !== undefined && taskCount > 0 && (
            <>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <Badge
                variant="default"
                className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border-0 font-medium"
              >
                {taskCount} {taskCount === 1 ? "task" : "tasks"}
              </Badge>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
