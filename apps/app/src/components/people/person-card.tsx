"use client";

import { User2, CheckSquare, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface Person {
  id: string;
  name: string;
  initials: string;
  context: string;
  lastMentioned: string;
  openTaskCount: number;
  memoryCount: number;
  color: string;
}

const avatarColors = [
  "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
];

export function PersonCard({ person }: { person: Person }) {
  const colorClass = avatarColors[person.color ? parseInt(person.color) % avatarColors.length : 0];

  return (
    <Link
      href={`/dashboard/people/${person.id}`}
      className="group rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
            colorClass
          )}
        >
          {person.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
            {person.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {person.context}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <User2 className="w-3 h-3" />
          {person.lastMentioned}
        </span>
        <span className="flex items-center gap-1">
          <CheckSquare className="w-3 h-3" />
          {person.openTaskCount} task{person.openTaskCount !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Database className="w-3 h-3" />
          {person.memoryCount} memor{person.memoryCount !== 1 ? "ies" : "y"}
        </span>
      </div>
    </Link>
  );
}
