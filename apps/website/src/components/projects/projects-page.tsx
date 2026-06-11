"use client";

import { useEffect, useState, useCallback } from "react";
import { FolderKanban, CheckSquare, Database, Sparkles, Plus, Inbox, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ProjectMemory } from "@/lib/types";

function normalizeProject(raw: any): ProjectMemory {
  return {
    id: raw.id ?? crypto.randomUUID(),
    name: raw.name ?? "Untitled",
    description: raw.description ?? "",
    pinnedMemories: raw.pinnedMemories ?? raw.pinned_memories ?? 0,
    openTasks: raw.openTasks ?? raw.open_tasks ?? 0,
    people: raw.people ?? [],
    extractionStatus: raw.extractionStatus ?? raw.extraction_status ?? "manual",
  };
}

const avatarColors = [
  "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
];

function ProjectCard({ 
  project, 
  onUpdate 
}: { 
  project: ProjectMemory;
  onUpdate?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const isPending = project.extractionStatus === "extracted_pending";

  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await api.projects.approve(project.id);
      toast.success("Project approved");
      onUpdate?.();
    } catch (err) {
      toast.error("Failed to approve project");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await api.projects.dismiss(project.id);
      toast.info("Project dismissed");
      onUpdate?.();
    } catch (err) {
      toast.error("Failed to dismiss project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-border bg-card p-4 flex flex-col transition-all cursor-pointer group h-full",
        isPending 
          ? "border-dashed border-emerald-500/30 bg-emerald-500/[0.02]" 
          : "hover:border-primary/30 shadow-sm hover:shadow-md"
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          "size-9 rounded-xl flex items-center justify-center shrink-0",
          isPending ? "bg-emerald-500/20 text-emerald-500" : "bg-primary/10 text-primary"
        )}>
          {isPending ? <Sparkles className="size-4" /> : <FolderKanban className="size-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors font-[var(--font-nunito)] truncate">
            {project.name}
          </p>
          {project.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
          <span className="inline-flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded-md">
            <Database className="size-3" />
            {project.pinnedMemories}
          </span>
          <span className="inline-flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded-md">
            <CheckSquare className="size-3" />
            {project.openTasks}
          </span>
        </div>

        {project.people.length > 0 && (
          <div className="flex -space-x-1.5 shrink-0">
            {project.people.slice(0, 4).map((name, i) => (
              <Avatar key={i} className="ring-2 ring-card w-6 h-6">
                <AvatarFallback
                  className={cn(
                    "text-[9px] font-bold",
                    avatarColors[i % avatarColors.length]
                  )}
                >
                  {name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        )}
      </div>

      {isPending && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-emerald-500/10">
          <Button
            size="xs"
            variant="default"
            className="flex-1 h-7 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
            onClick={handleApprove}
            disabled={loading}
          >
            <Check className="size-3 mr-1" /> Approve
          </Button>
          <Button
            size="xs"
            variant="ghost"
            className="flex-1 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg text-[10px] font-bold"
            onClick={handleDismiss}
            disabled={loading}
          >
            <X className="size-3 mr-1" /> Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}

export function ProjectsPage() {
  const [activeProjects, setActiveProjects] = useState<ProjectMemory[]>([]);
  const [pendingProjects, setPendingProjects] = useState<ProjectMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [activeRes, pendingRes] = await Promise.all([
        api.projects.list("manual"),
        api.projects.list("extracted_pending"),
      ]);
      
      const activeItems = Array.isArray(activeRes) ? activeRes : activeRes?.data ?? [];
      const pendingItems = Array.isArray(pendingRes) ? pendingRes : pendingRes?.data ?? [];

      setActiveProjects(activeItems.map(normalizeProject));
      setPendingProjects(pendingItems.map(normalizeProject));
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch projects", err);
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const header = (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-[var(--font-nunito)]">Projects</h1>
        <p className="text-xs text-muted-foreground mt-1">Threads of work pulled from your memories.</p>
      </div>
      <Button className="rounded-xl bg-primary text-primary-foreground font-bold text-xs h-9 px-4 shadow-[0_2px_0_#46A302] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none transition-all">
        <Plus className="size-3.5 mr-1.5 stroke-[3px]" />
        New Project
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-lg mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-card border-2 border-border rounded-2xl" />
            ))}
          </div>
          <div className="h-96 bg-card border-2 border-border rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-5">
        {header}
        <div className="flex flex-col items-center text-center py-16 gap-3 border-2 border-dashed border-border rounded-3xl">
          <div className="size-10 rounded-xl bg-accent flex items-center justify-center">
            <FolderKanban className="size-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground max-w-[28ch]">
            Could not load projects. Make sure the API is running.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {header}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Active Projects View */}
        <div className="lg:col-span-8">
          {activeProjects.length === 0 ? (
            <div className="flex flex-col items-center text-center py-24 gap-3 border-2 border-dashed border-border rounded-3xl">
              <div className="size-12 rounded-2xl bg-accent flex items-center justify-center">
                <FolderKanban className="size-6 text-muted-foreground/50" />
              </div>
              <p className="text-xs text-muted-foreground font-medium max-w-[30ch]">
                No active projects. Start a new one manually or wait for Debo to suggest one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onUpdate={fetchData} />
              ))}
            </div>
          )}
        </div>

        {/* AI Inbox Sidebar */}
        <div className="lg:col-span-4 sticky top-8">
          <div className="rounded-3xl border-2 border-emerald-500/10 bg-emerald-500/[0.02] overflow-hidden flex flex-col max-h-[calc(100vh-160px)]">
            <div className="p-4 border-b border-emerald-500/10 bg-emerald-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-foreground font-[var(--font-nunito)]">Suggested Projects</h2>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-bold">
                {pendingProjects.length} New
              </Badge>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {pendingProjects.length > 0 ? (
                  pendingProjects.map(project => (
                    <ProjectCard key={project.id} project={project} onUpdate={fetchData} />
                  ))
                ) : (
                  <div className="py-12 text-center space-y-2">
                    <Inbox className="size-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-[11px] text-muted-foreground font-medium px-4">
                      Debo will suggest new projects here when multiple tasks or memories clump around a topic.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
