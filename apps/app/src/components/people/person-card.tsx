"use client";

import { CheckSquare, Database, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { PersonMemory } from "@/lib/types";

const avatarColors = [
  "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function relativeDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PersonCard({ person }: { person: PersonMemory }) {
  const colorIdx =
    person.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
    avatarColors.length;

  return (
    <Link href={`/dashboard/people/${person.id}`} className="group block">
      <Card
        className="rounded-xl transition-all duration-200 hover:border-primary/30 hover:shadow-md cursor-pointer"
        style={{
          boxShadow:
            "0 2px 0 0 hsl(var(--border)), 0 4px 8px -2px hsl(var(--foreground) / 0.06)",
        }}
      >
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start gap-3">
            <Avatar size="lg">
              <AvatarFallback
                className={cn(
                  "text-sm font-bold",
                  avatarColors[colorIdx]
                )}
              >
                {getInitials(person.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                {person.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {person.context}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="gap-1 text-[11px]">
              <Clock className="w-3 h-3" />
              {relativeDate(person.lastMentioned)}
            </Badge>
            <Badge variant="secondary" className="gap-1 text-[11px]">
              <CheckSquare className="w-3 h-3" />
              {person.openTaskCount} task{person.openTaskCount !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="secondary" className="gap-1 text-[11px]">
              <Database className="w-3 h-3" />
              {person.memoryCount} memor
              {person.memoryCount !== 1 ? "ies" : "y"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
