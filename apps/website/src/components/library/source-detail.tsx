"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Mic,
  FileText,
  Link as LinkIcon,
  Users,
  CheckSquare,
  Calendar,
  AlertCircle,
  Loader2,
  MessageSquare,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import type { MemorySource, SourceType, SourceStatus } from "@/lib/types";

interface SourceDetailPageProps {
  sourceId: string;
}

function normalizeSource(raw: any): MemorySource {
  return {
    id: raw.id ?? "",
    type: raw.type ?? "file",
    title: raw.title ?? "Untitled",
    summary: raw.summary ?? "",
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    status: raw.status ?? "ready",
    people: raw.people ?? [],
    projects: raw.projects ?? [],
    taskCount: raw.taskCount ?? raw.task_count ?? 0,
    sourceLabel: raw.sourceLabel ?? raw.source_label ?? "",
  };
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

const TYPE_LABELS: Record<SourceType, string> = {
  journal: "Journal",
  voice: "Voice note",
  file: "File",
  link: "Link",
  meeting: "Meeting",
  task: "Task",
  email: "Email",
  calendar: "Calendar",
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

export function SourceDetailPage({ sourceId }: SourceDetailPageProps) {
  const [source, setSource] = useState<MemorySource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchSource() {
      try {
        const data = await api.sources.get(sourceId);
        if (!cancelled) {
          setSource(normalizeSource(data));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }
    fetchSource();
    return () => { cancelled = true; };
  }, [sourceId]);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-border flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link href="/dashboard/library">
              <ArrowLeft className="size-4" />
              Library
            </Link>
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="space-y-4 w-full max-w-3xl px-6">
            <div className="h-8 w-64 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !source) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-border flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link href="/dashboard/library">
              <ArrowLeft className="size-4" />
              Library
            </Link>
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Could not load source. Make sure the API is running.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const TypeIcon = TYPE_ICONS[source.type] ?? FileText;
  const statusCfg = STATUS_CONFIG[source.status];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-border flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link href="/dashboard/library">
            <ArrowLeft className="size-4" />
            Library
          </Link>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="size-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <TypeIcon className="size-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground">
                  {source.title}
                </h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <Badge variant="secondary" className="gap-1.5">
                    <TypeIcon className="size-3.5" />
                    {TYPE_LABELS[source.type]}
                  </Badge>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    {new Date(source.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <Badge variant={statusCfg.variant} className="gap-1">
                    <StatusIcon
                      className={cn("size-3", source.status === "processing" && "animate-spin")}
                    />
                    {statusCfg.label}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button size="sm" className="gap-1.5">
                <MessageSquare className="size-3.5" />
                Ask about this
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="size-3.5" />
                Create task
              </Button>
              <Button variant="destructive" size="sm" className="gap-1.5 ml-auto">
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Summary */}
          <Section title="Summary">
            <p className="text-sm text-foreground leading-relaxed">
              {source.summary}
            </p>
          </Section>

          {/* Extracted Memories */}
          <Section title="Extracted memories">
            <div className="space-y-6">
              {/* People */}
              {source.people.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="size-3.5 text-muted-foreground" />
                    <h3 className="text-xs font-semibold text-foreground">People</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {source.people.map((person) => (
                      <Badge key={person} variant="secondary" className="gap-1.5 py-1 px-2.5">
                        <Avatar size="sm" className="size-4">
                          <AvatarFallback className="text-[9px]">{person[0]}</AvatarFallback>
                        </Avatar>
                        {person}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        </div>
      </ScrollArea>
    </div>
  );
}

// --- Helper components ---

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}
