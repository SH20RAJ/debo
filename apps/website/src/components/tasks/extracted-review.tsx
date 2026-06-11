"use client";

import { useState, useEffect } from "react";
import { Sparkles, Check, Pencil, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ExtractedTask {
  id: string;
  title: string;
  sourceExcerpt: string;
  source: string;
  confidence: "strong" | "partial" | "weak";
}

const confidenceLabel: Record<string, string> = {
  strong: "Strong",
  partial: "Partial",
  weak: "Weak",
};

function ExtractedItem({
  task,
  onDismiss,
  onAccept,
}: {
  task: ExtractedTask;
  onDismiss: (id: string) => void;
  onAccept: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">{task.title}</p>
            <Badge
              variant="outline"
              className="shrink-0 gap-1 rounded-full text-[10px] border-border"
            >
              <Sparkles className="size-3 text-primary/70" />
              {confidenceLabel[task.confidence]}
            </Badge>
          </div>

          <p className="text-[11px] text-muted-foreground">{task.source}</p>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown
              className={cn(
                "size-3 transition-transform",
                expanded && "rotate-180"
              )}
            />
            Source excerpt
          </button>

          {expanded && (
            <p className="text-xs text-muted-foreground italic pl-3 border-l-2 border-border">
              {task.sourceExcerpt}
            </p>
          )}

          <div className="flex items-center gap-1.5 pt-1">
            <Button
              size="xs"
              className={cn(
                "rounded-lg gap-1 bg-primary text-primary-foreground",
                "shadow-[0_3px_0_#46A302] hover:brightness-105",
                "active:translate-y-[2px] active:shadow-none transition-all"
              )}
              onClick={() => onAccept(task.id)}
            >
              <Check className="size-3" />
              Accept
            </Button>
            <Button
              size="xs"
              variant="ghost"
              className="rounded-lg gap-1 text-muted-foreground hover:text-foreground hover:bg-accent/60"
            >
              <Pencil className="size-3" />
              Edit
            </Button>
            <Button
              size="xs"
              variant="ghost"
              className="rounded-lg gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDismiss(task.id)}
            >
              <X className="size-3" />
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExtractedReview() {
  const [tasks, setTasks] = useState<ExtractedTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tasks
      .list({ extractionStatus: "extracted_pending" })
      .then((data: any) => {
        const arr: any[] = Array.isArray(data) ? data : [];
        const mapped: ExtractedTask[] = arr.map((t: any) => ({
          id: String(t.id),
          title: t.title || t.description || "Untitled",
          sourceExcerpt: t.description || t.title || "",
          source: "Tasks · Inbox",
          confidence: "partial" as const,
        }));
        setTasks(mapped);
      })
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const dismiss = (id: string) => {
    api.tasks
      .dismiss(id)
      .then(() => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        toast.success("Dismissed");
      })
      .catch(() => toast.error("Failed to dismiss"));
  };

  const accept = (id: string) => {
    api.tasks
      .approve(id)
      .then(() => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        toast.success("Task approved");
      })
      .catch(() => toast.error("Failed to approve"));
  };

  if (loading && tasks.length === 0) return null;
  if (tasks.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground font-[var(--font-nunito)]">
          Debo found {tasks.length} possible task
          {tasks.length !== 1 ? "s" : ""}
        </h2>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <ExtractedItem
            key={task.id}
            task={task}
            onDismiss={dismiss}
            onAccept={accept}
          />
        ))}
      </div>
    </section>
  );
}
