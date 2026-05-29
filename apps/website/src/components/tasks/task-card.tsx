"use client";

import { useState } from "react";
import { Calendar, User2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { DeboTask } from "@/lib/types";

const confidenceConfig: Record<
  DeboTask["confidence"],
  { label: string }
> = {
  strong: { label: "Strong" },
  partial: { label: "Partial" },
  weak: { label: "Weak" },
};

export function TaskCard({ task }: { task: DeboTask }) {
  const [checked, setChecked] = useState(task.status === "done");
  const conf = confidenceConfig[task.confidence];

  const dueLabel = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-border bg-card p-3 transition-colors",
        checked
          ? "opacity-50"
          : "hover:border-primary/30"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={(v) => setChecked(v === true)}
          className="mt-0.5"
        />

        <div className="flex-1 min-w-0 space-y-1">
          <p
            className={cn(
              "text-sm font-medium leading-snug text-foreground",
              checked && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            {dueLabel && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3" />
                {dueLabel}
              </span>
            )}
            {task.relatedPerson && (
              <span className="inline-flex items-center gap-1">
                <User2 className="size-3" />
                {task.relatedPerson}
              </span>
            )}
          </div>
        </div>

        <Badge
          variant="outline"
          className="shrink-0 gap-1 rounded-full text-[10px] border-border"
        >
          <Sparkles className="size-3 text-primary/70" />
          {conf.label}
        </Badge>
      </div>
    </div>
  );
}
