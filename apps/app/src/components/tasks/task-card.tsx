"use client";

import { useState } from "react";
import { Calendar, User2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { DeboTask } from "@/lib/types";

const confidenceConfig: Record<
  DeboTask["confidence"],
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  strong: { label: "Strong", variant: "default" },
  partial: { label: "Partial", variant: "secondary" },
  weak: { label: "Weak", variant: "outline" },
};

const sourceIcons: Record<string, string> = {
  voice: "🎙",
  journal: "📓",
  meeting: "📋",
  file: "📄",
  email: "✉️",
  calendar: "📅",
  link: "🔗",
  task: "✅",
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
    <Card
      className={cn(
        "transition-all duration-200 rounded-xl",
        checked
          ? "opacity-50 border-border/50"
          : "hover:border-primary/30 hover:shadow-md"
      )}
      style={{
        boxShadow: checked
          ? undefined
          : "0 2px 0 0 hsl(var(--border)), 0 4px 8px -2px hsl(var(--foreground) / 0.06)",
      }}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <Checkbox
          checked={checked}
          onCheckedChange={(v) => setChecked(v === true)}
          className="mt-0.5"
        />

        <div className="flex-1 min-w-0 space-y-1.5">
          <p
            className={cn(
              "text-sm font-semibold leading-snug",
              checked && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {dueLabel && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {dueLabel}
              </span>
            )}

            {task.relatedPerson && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <User2 className="w-3 h-3" />
                {task.relatedPerson}
              </span>
            )}

            {task.sourceId && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <span aria-hidden="true">{sourceIcons.journal}</span>
                Source
              </span>
            )}
          </div>
        </div>

        <Badge variant={conf.variant} className="shrink-0 gap-1">
          <Sparkles className="w-3 h-3" />
          {conf.label}
        </Badge>
      </CardContent>
    </Card>
  );
}
