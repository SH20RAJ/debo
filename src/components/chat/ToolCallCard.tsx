"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Search, Brain, Calendar, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCallCardProps {
  toolInvocation: any;
}

export function ToolCallCard({ toolInvocation }: ToolCallCardProps) {
  const { toolName, state } = toolInvocation;
  
  const getToolIcon = () => {
    switch (toolName) {
      case "search_journals":
        return <Search className="w-3.5 h-3.5" />;
      case "get_memories":
        return <Brain className="w-3.5 h-3.5" />;
      case "get_recent_entries":
        return <Calendar className="w-3.5 h-3.5" />;
      default:
        return <Search className="w-3.5 h-3.5" />;
    }
  };

  const getToolLabel = () => {
    switch (toolName) {
      case "search_journals":
        return state === "result" ? "Searched journals" : "Searching journals...";
      case "get_memories":
        return state === "result" ? "Accessed memories" : "Accessing memories...";
      case "get_recent_entries":
        return state === "result" ? "Fetched recent entries" : "Fetching recent entries...";
      default:
        return toolName;
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200",
      state === "result" 
        ? "bg-background border-border text-muted-foreground" 
        : "bg-primary/5 border-primary/20 text-primary animate-pulse"
    )}>
      <div className={cn(
        "flex items-center justify-center w-5 h-5 rounded-full",
        state === "result" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
      )}>
        {state === "result" ? <Check className="w-3 h-3" /> : getToolIcon()}
      </div>
      <span>{getToolLabel()}</span>
      {state === "call" && (
        <Loader2 className="w-3 h-3 animate-spin ml-auto" />
      )}
    </div>
  );
}
