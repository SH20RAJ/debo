"use client";

import {
  ListPlus,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Search,
  CheckSquare,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface ActionItem {
  id: string;
  label: string;
  icon?: LucideIcon | string;
  kind?: "ask" | "task" | "draft" | "search";
}

const ICON_MAP: Record<string, LucideIcon> = {
  "create-task": ListPlus,
  "draft-message": MessageSquare,
  "open-source": ExternalLink,
  "mark-done": CheckCircle2,
  "summarize_sources": Sparkles,
  "review_tasks": CheckSquare,
  "draft_from_memory": FileText,
};

const KIND_MAP: Record<string, LucideIcon> = {
  ask: Sparkles,
  task: CheckSquare,
  draft: FileText,
  search: Search,
};

const DEFAULT_ACTIONS: ActionItem[] = [
  { id: "create-task", label: "Create task", icon: ListPlus },
  { id: "draft-message", label: "Draft message", icon: MessageSquare },
  { id: "open-source", label: "Open source", icon: ExternalLink },
];

interface SuggestedActionsProps {
  actions?: ActionItem[];
}

export function SuggestedActions({ actions = DEFAULT_ACTIONS }: SuggestedActionsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3 select-none">
      {actions.map((action) => {
        // Resolve the icon component safely
        let Icon: LucideIcon = ExternalLink;
        
        if (action.icon) {
          if (typeof action.icon === "string") {
            Icon = ICON_MAP[action.icon] || ICON_MAP[action.id] || ExternalLink;
          } else {
            Icon = action.icon;
          }
        } else if (action.kind) {
          Icon = KIND_MAP[action.kind] || ExternalLink;
        } else {
          Icon = ICON_MAP[action.id] || ExternalLink;
        }

        const handleActionClick = () => {
          toast.success(`Action triggered: ${action.label}`);
        };

        return (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={handleActionClick}
            className={cn(
              "rounded-full gap-1.5 px-3 py-1.5 text-xs font-semibold border border-white/5",
              "bg-[#131911]/30 hover:bg-[#131911]/60 hover:border-emerald-500/20 hover:text-emerald-400 transition-all cursor-pointer"
            )}
          >
            <Icon className="w-3.5 h-3.5 text-emerald-500/80" />
            <span>{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

// Simple fallback helper for classnames inside components that might not import cn
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
