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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  ready: { label: "Ready", variant: "default", icon: CheckSquare },
  processing: { label: "Processing", variant: "secondary", icon: Loader2 },
  needs_review: { label: "Needs review", variant: "outline", icon: AlertCircle },
  failed: { label: "Failed", variant: "destructive", icon: AlertCircle },
};

export function SourceCard({ source, variant }: SourceCardProps) {
  const TypeIcon = TYPE_ICONS[source.type] ?? FileText;
  const statusCfg = STATUS_CONFIG[source.status];
  const StatusIcon = statusCfg.icon;

  if (variant === "list") {
    return (
      <Link href={`/dashboard/library/${source.id}`} className="block">
        <Card className="flex-row items-center gap-4 p-3 py-3 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group">
          <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <TypeIcon className="size-4 text-muted-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground truncate">
                {source.title}
              </p>
              <Badge variant={statusCfg.variant} className="gap-1 text-[10px] px-1.5 py-0">
                <StatusIcon
                  className={cn("size-2.5", source.status === "processing" && "animate-spin")}
                />
                {statusCfg.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {source.summary}
            </p>
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
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="size-3" />
              {new Date(source.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </Card>
      </Link>
    );
  }

  // Grid variant
  return (
    <Link href={`/dashboard/library/${source.id}`} className="block">
      <Card className="hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
              <TypeIcon className="size-4 text-muted-foreground" />
            </div>
            <Badge variant={statusCfg.variant} className="gap-1 text-[10px] px-1.5 py-0">
              <StatusIcon
                className={cn("size-2.5", source.status === "processing" && "animate-spin")}
              />
              {statusCfg.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
            {source.title}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {source.summary}
          </p>

          <div className="flex items-center justify-between pt-2.5 border-t border-border">
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
        </CardContent>
      </Card>
    </Link>
  );
}
