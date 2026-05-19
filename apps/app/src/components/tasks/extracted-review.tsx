"use client";

import { useState } from "react";
import { Sparkles, Check, Pencil, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ExtractedTask {
  id: string;
  title: string;
  sourceExcerpt: string;
  source: string;
  confidence: "strong" | "partial" | "weak";
}

const mockExtracted: ExtractedTask[] = [
  {
    id: "ext-1",
    title: "Send finalized Q4 budget to Raj",
    sourceExcerpt:
      '"...I promised Raj I\'ll send the finalized Q4 budget allocation by Friday before the board meeting..."',
    source: "Marketing Sync voice note",
    confidence: "strong",
  },
  {
    id: "ext-2",
    title: "Follow up with Sarah about API integration",
    sourceExcerpt:
      '"...need to circle back with Sarah on the API integration timeline, she mentioned next sprint..."',
    source: "Customer Call",
    confidence: "partial",
  },
  {
    id: "ext-3",
    title: "Draft blog post on memory OS",
    sourceExcerpt:
      '"...should write a blog post explaining the memory OS concept, could be great for launch..."',
    source: "Weekly Review journal",
    confidence: "partial",
  },
];

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
}: {
  task: ExtractedTask;
  onDismiss: (id: string) => void;
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
          <Button size="sm" className="rounded-lg gap-1.5">
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
  const [tasks, setTasks] = useState(mockExtracted);

  function dismiss(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

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
          <ExtractedItem key={task.id} task={task} onDismiss={dismiss} />
        ))}
      </div>
    </section>
  );
}
