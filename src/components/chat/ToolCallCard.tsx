"use client";

import { AlertTriangle, Brain, CalendarDays, Check, Loader2, Search } from "lucide-react";

import { cn } from "@/lib/utils";

interface ToolCallCardProps {
  part: Record<string, any>;
}

const toolConfig = {
  search_journals: {
    icon: Search,
    active: "Searching journals...",
    done: "Searched journals",
  },
  get_memories: {
    icon: Brain,
    active: "Accessing memories...",
    done: "Accessed memories",
  },
  get_recent_entries: {
    icon: CalendarDays,
    active: "Fetching recent entries...",
    done: "Fetched recent entries",
  },
};

export function ToolCallCard({ part }: ToolCallCardProps) {
  const toolName = getToolName(part);
  const config = toolConfig[toolName as keyof typeof toolConfig] || {
    icon: Search,
    active: "Using tool...",
    done: "Tool complete",
  };
  const Icon = config.icon;
  const isDone = part.state === "output-available" || part.state === "result";
  const isError = part.state === "output-error";
  const count = getOutputCount(part.output || part.result);

  return (
    <div
      className={cn(
        "flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium shadow-sm transition",
        isDone &&
          "border-border/70 bg-background text-muted-foreground",
        isError &&
          "border-destructive/30 bg-destructive/10 text-destructive",
        !isDone &&
          !isError &&
          "border-primary/25 bg-primary/10 text-primary"
      )}
    >
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-md",
          isDone ? "bg-muted text-muted-foreground" : "bg-background/70"
        )}
      >
        {isError ? (
          <AlertTriangle className="size-3.5" />
        ) : isDone ? (
          <Check className="size-3.5" />
        ) : (
          <Icon className="size-3.5" />
        )}
      </span>
      <span className="truncate">
        {isError ? "Tool call failed" : isDone ? config.done : config.active}
      </span>
      {isDone && count > 0 && (
        <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {count}
        </span>
      )}
      {!isDone && !isError && (
        <Loader2 className="ml-auto size-3.5 animate-spin" />
      )}
    </div>
  );
}

function getToolName(part: Record<string, any>) {
  if (typeof part.toolName === "string") {
    return part.toolName;
  }

  if (typeof part.type === "string" && part.type.startsWith("tool-")) {
    return part.type.slice("tool-".length);
  }

  return "tool";
}

function getOutputCount(output: unknown) {
  if (Array.isArray(output)) {
    return output.length;
  }

  const citations = (output as { citations?: unknown } | undefined)?.citations;
  return Array.isArray(citations) ? citations.length : 0;
}
