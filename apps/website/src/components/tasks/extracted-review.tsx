"use client";

import { useState, useEffect } from "react";
import { Sparkles, Check, Pencil, X, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
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

const confidenceConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  strong: { label: "Strong", variant: "default" },
  partial: { label: "Partial", variant: "secondary" },
  weak: { label: "Weak", variant: "outline" },
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
  const conf = confidenceConfig[task.confidence];

  return (
    <Card
      className="rounded-xl transition-all duration-200 hover:border-primary/20"
      style={{
        boxShadow:
          "0 2px 0 0 hsl(var(--border)), 0 4px 8px -2px hsl(var(--foreground) / 0.06)",
      }}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{task.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{task.source}</p>
          </div>
          <Badge variant={conf.variant} className="shrink-0 gap-1">
            <Sparkles className="w-3 h-3" />
            {conf.label}
          </Badge>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown
            className={cn(
              "w-3 h-3 transition-transform",
              expanded && "rotate-180"
            )}
          />
          Source excerpt
        </button>

        {expanded && (
          <p className="text-xs text-muted-foreground italic pl-4 border-l-2 border-border">
            {task.sourceExcerpt}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Button size="sm" className="rounded-lg gap-1.5" onClick={() => onAccept(task.id)}>
            <Check className="w-3 h-3" />
            Accept
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5">
            <Pencil className="w-3 h-3" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg gap-1.5 text-muted-foreground hover:text-destructive"
            onClick={() => onDismiss(task.id)}
          >
            <X className="w-3 h-3" />
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExtractedReview() {
  const [tasks, setTasks] = useState<ExtractedTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tasks.list("inbox")
      .then((data: any) => {
        const mapped: ExtractedTask[] = (data ?? []).map((t: any) => ({
          id: t.id,
          title: t.title || t.description || "Untitled",
          sourceExcerpt: t.description || t.title || "",
          source: "Tasks · Inbox",
          confidence: ("partial" as "strong" | "partial" | "weak"),
        }));
        setTasks(mapped);
      })
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const dismiss = (id: string) => {
    api.tasks.dismiss(id).then(() => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Dismissed");
    }).catch(() => toast.error("Failed to dismiss"));
  };

  const accept = (id: string) => {
    api.tasks.approve(id).then(() => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task approved");
    }).catch(() => toast.error("Failed to approve"));
  };

  if (loading && tasks.length === 0) return null;
  if (tasks.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold">
          Debo found {tasks.length} possible task
          {tasks.length !== 1 ? "s" : ""}
        </h2>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <ExtractedItem key={task.id} task={task} onDismiss={dismiss} onAccept={accept} />
        ))}
      </div>
    </section>
  );
}
