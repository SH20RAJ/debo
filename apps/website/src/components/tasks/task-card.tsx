"use client";

import { useState } from "react";
import { Calendar, User2, Sparkles, Check, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { DeboTask } from "@/lib/types";

const confidenceConfig: Record<
  DeboTask["confidence"],
  { label: string; color: string }
> = {
  strong: { label: "Strong", color: "text-emerald-500" },
  partial: { label: "Partial", color: "text-amber-500" },
  weak: { label: "Weak", color: "text-muted-foreground" },
};

export function TaskCard({ 
  task, 
  onUpdate 
}: { 
  task: DeboTask;
  onUpdate?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const isPending = task.extractionStatus === "extracted_pending";
  const isDone = task.status === "done";
  
  const conf = confidenceConfig[task.confidence];

  const dueLabel = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : null;

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      await api.tasks.update(task.id, { status: checked ? "done" : "todo" });
      onUpdate?.();
    } catch (err) {
      toast.error("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.tasks.approve(task.id);
      toast.success("Task approved");
      onUpdate?.();
    } catch (err) {
      toast.error("Failed to approve task");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    setLoading(true);
    try {
      await api.tasks.dismiss(task.id);
      toast.info("Task dismissed");
      onUpdate?.();
    } catch (err) {
      toast.error("Failed to dismiss task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-border bg-card p-3 transition-all",
        isDone ? "opacity-60 grayscale-[0.2]" : "hover:border-primary/30 shadow-sm hover:shadow-md",
        isPending && "border-dashed border-emerald-500/30 bg-emerald-500/[0.02]"
      )}
    >
      <div className="flex items-start gap-3">
        {!isPending && (
          <Checkbox
            checked={isDone}
            onCheckedChange={(v) => handleToggle(v === true)}
            disabled={loading}
            className="mt-0.5"
          />
        )}
        
        {isPending && (
          <div className="mt-1 size-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="size-2.5 text-emerald-500" />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1.5">
          <p
            className={cn(
              "text-sm font-semibold leading-snug text-foreground",
              isDone && "line-through text-muted-foreground font-normal"
            )}
          >
            {task.title}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground font-medium">
            {dueLabel && (
              <span className="inline-flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded-md">
                <Calendar className="size-3" />
                {dueLabel}
              </span>
            )}
            {task.relatedPerson && (
              <span className="inline-flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded-md">
                <User2 className="size-3" />
                {task.relatedPerson}
              </span>
            )}
            {isPending && (
              <span className={cn("inline-flex items-center gap-1", conf.color)}>
                <Sparkles className="size-3" />
                {conf.label} confidence
              </span>
            )}
          </div>

          {isPending && (
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="xs"
                variant="default"
                className="h-7 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
                onClick={handleApprove}
                disabled={loading}
              >
                <Check className="size-3 mr-1" />
                Approve
              </Button>
              <Button
                size="xs"
                variant="ghost"
                className="h-7 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg text-[10px] font-bold"
                onClick={handleDismiss}
                disabled={loading}
              >
                <X className="size-3 mr-1" />
                Dismiss
              </Button>
            </div>
          )}
        </div>

        {!isPending && !isDone && (
          <Badge
            variant="outline"
            className="shrink-0 rounded-full text-[9px] font-bold uppercase tracking-wider border-border/60 bg-muted/30"
          >
            {task.status}
          </Badge>
        )}
      </div>
    </div>
  );
}
