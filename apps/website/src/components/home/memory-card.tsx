"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    <Card className="flex h-full flex-col transition-colors hover:bg-muted/30">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">{sourceLabel}</p>
          </div>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {summary}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground">{date}</span>
          {people && people.length > 0 && (
            <>
              <span className="text-xs text-muted-foreground">·</span>
              <TooltipProvider>
                <div className="flex items-center gap-1">
                  {people.map((person) => (
                    <Tooltip key={person}>
                      <TooltipTrigger>
                        <Avatar>
                          <AvatarFallback className="text-[10px] font-medium">
                            {getInitials(person)}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>{person}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </>
          )}
          {taskCount !== undefined && taskCount > 0 && (
            <>
              <span className="text-xs text-muted-foreground">·</span>
              <Badge variant="secondary">
                {taskCount} {taskCount === 1 ? "task" : "tasks"}
              </Badge>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
