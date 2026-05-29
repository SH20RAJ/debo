"use client";

import Link from "next/link";
import {
  BookOpen,
  Mic,
  FileText,
  Link as LinkIcon,
  Users,
  CheckSquare,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MemorySource, SourceType, SourceStatus } from "@/lib/types";

interface SourceCardProps {
  source: MemorySource;
  variant: "grid" | "list";
}

const TYPE_ICONS: Record<SourceType, React.ComponentType<{ className?: string }>> = {
  journal: BookOpen,
  voice: Mic,
  file: FileText,
  link: LinkIcon,
  meeting: Users,
  task: CheckSquare,
  email: FileText,
  calendar: Calendar,
};

const STATUS_CONFIG: Record<
  SourceStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ComponentType<{ className?: string }> }
> = {
  ready: { label: "Ready", variant: "outline", icon: CheckSquare },
  processing: { label: "Processing", variant: "secondary", icon: Loader2 },
  needs_review: { label: "Needs review", variant: "outline", icon: AlertCircle },
  failed: { label: "Failed", variant: "destructive", icon: AlertCircle },
};

const baseCard =
  "rounded-2xl border-2 border-border bg-card transition-colors hover:border-primary/30";

export function SourceCard({ source, variant }: SourceCardProps) {
  const TypeIcon = TYPE_ICONS[source.type] ?? FileText;
  const statusCfg = STATUS_CONFIG[source.status];
  const StatusIcon = statusCfg.icon;

  if (variant === "list") {
    return (
      <Link href={`/dashboard/library/${source.id}`} className="block">
        <div
          className={cn(
            baseCard,
            "flex items-center gap-3 px-3 py-2.5 cursor-pointer group"
          )}
        >
          <div className="size-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <TypeIcon className="size-4 text-muted-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground truncate">
                {source.title}
              </p>
              {source.status !== "ready" && (
                <Badge
                  variant={statusCfg.variant}
                  className="gap-1 text-[10px] px-1.5 py-0 rounded-full"
                >
                  <StatusIcon
                    className={cn(
                      "size-2.5",
                      source.status === "processing" && "animate-spin"
                    )}
                  />
                  {statusCfg.label}
                </Badge>
              )}
            </div>
            {source.summary && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {source.summary}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {source.people.length > 0 && (
              <AvatarGroup>
                {source.people.slice(0, 3).map((p) => (
                  <TooltipProvider key={p}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar size="sm">
                          <AvatarFallback className="text-[9px]">{p[0]}</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>{p}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </AvatarGroup>
            )}
            {source.taskCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <CheckSquare className="size-3" />
                {source.taskCount}
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {new Date(source.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Grid variant
  return (
    <Link href={`/dashboard/library/${source.id}`} className="block h-full">
      <div className={cn(baseCard, "p-4 cursor-pointer group h-full flex flex-col")}>
        <div className="flex items-start justify-between mb-3">
          <div className="size-9 rounded-xl bg-accent flex items-center justify-center">
            <TypeIcon className="size-4 text-muted-foreground" />
          </div>
          {source.status !== "ready" && (
            <Badge
              variant={statusCfg.variant}
              className="gap-1 text-[10px] px-1.5 py-0 rounded-full"
            >
              <StatusIcon
                className={cn(
                  "size-2.5",
                  source.status === "processing" && "animate-spin"
                )}
              />
              {statusCfg.label}
            </Badge>
          )}
        </div>

        <p className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
          {source.title}
        </p>
        {source.summary && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
            {source.summary}
          </p>
        )}

        <div className="flex items-center justify-between pt-2.5 mt-auto border-t border-border">
          <div className="flex items-center gap-2">
            {source.people.length > 0 && (
              <AvatarGroup>
                {source.people.slice(0, 3).map((p) => (
                  <TooltipProvider key={p}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar size="sm">
                          <AvatarFallback className="text-[9px]">{p[0]}</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>{p}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </AvatarGroup>
            )}
            {source.taskCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <CheckSquare className="size-3" />
                {source.taskCount}
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {new Date(source.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
