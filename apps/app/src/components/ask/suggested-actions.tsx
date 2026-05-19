"use client";

import {
  ListPlus,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface ActionItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const DEFAULT_ACTIONS: ActionItem[] = [
  { id: "create-task", label: "Create task", icon: ListPlus },
  { id: "draft-message", label: "Draft message to Raj", icon: MessageSquare },
  { id: "open-source", label: "Open source", icon: ExternalLink },
  { id: "mark-done", label: "Mark done", icon: CheckCircle2 },
];

interface SuggestedActionsProps {
  actions?: ActionItem[];
}

export function SuggestedActions({ actions = DEFAULT_ACTIONS }: SuggestedActionsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={() => toast.success("Action queued")}
            className="rounded-full gap-1.5 px-3 py-1.5 text-xs font-medium border-border/60 hover:border-border hover:bg-muted/50 transition-all"
          >
            <Icon className="w-3 h-3" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
