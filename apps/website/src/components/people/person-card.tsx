"use client";

import { CheckSquare, Database, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
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
    <Link href={`/dashboard/people/${person.id}`} className="group block h-full">
      <div
        className={cn(
          "rounded-2xl border-2 border-border bg-card p-4 h-full",
          "transition-colors hover:border-primary/30 cursor-pointer"
        )}
      >
        <div className="flex items-start gap-3 mb-3">
          <Avatar size="lg">
            {person.avatar && <AvatarImage src={person.avatar} alt={person.name} className="object-cover" />}
            <AvatarFallback
              className={cn("text-sm font-bold", avatarColors[colorIdx])}
            >
              {getInitials(person.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors font-[var(--font-nunito)]">
              {person.name}
            </p>
            {person.context && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {person.context}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {relativeDate(person.lastMentioned)}
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckSquare className="size-3" />
            {person.openTaskCount} task{person.openTaskCount !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1">
            <Database className="size-3" />
            {person.memoryCount} memor{person.memoryCount !== 1 ? "ies" : "y"}
          </span>
        </div>
      </div>
    </Link>
  );
}
