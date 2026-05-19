"use client";

import {
  ListPlus,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const ACTIONS = [
  { id: "create-task", label: "Create task", icon: ListPlus },
  { id: "draft-message", label: "Draft message to Raj", icon: MessageSquare },
  { id: "open-source", label: "Open source", icon: ExternalLink },
  { id: "mark-done", label: "Mark done", icon: CheckCircle2 },
];

interface SuggestedActionsProps {
  actions?: typeof ACTIONS;
}

export function SuggestedActions({ actions = ACTIONS }: SuggestedActionsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => toast.success("Action queued")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all border border-border/50 hover:border-border"
          >
            <Icon className="w-3 h-3" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
