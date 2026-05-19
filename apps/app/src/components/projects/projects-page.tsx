"use client";

import { useEffect, useState } from "react";
import { FolderKanban, CheckSquare, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  };
}

const avatarColors = [
  "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
];

function ProjectCard({ project }: { project: ProjectMemory }) {
  return (
    <Card className="transition-all duration-200 hover:border-primary/30 hover:shadow-md cursor-pointer group">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <FolderKanban className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold group-hover:text-primary transition-colors">
              {project.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {project.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              {project.pinnedMemories} memories
            </span>
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3" />
              {project.openTasks} task{project.openTasks !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex -space-x-1.5">
            {project.people.map((name, i) => (
              <Avatar key={i} className="ring-2 ring-card w-6 h-6">
                <AvatarFallback className={cn("text-[9px] font-bold", avatarColors[i % avatarColors.length])}>
                  {name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchProjects() {
      try {
        const data = await api.projects.list();
        const items = Array.isArray(data) ? data : data?.projects ?? data?.data ?? [];
        if (!cancelled) {
          setProjects(items.map(normalizeProject));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }
    fetchProjects();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-primary" />
            Projects
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Projects group memories around ongoing work.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border-2 border-border bg-card p-6 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-primary" />
            Projects
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Projects group memories around ongoing work.
          </p>
        </div>
        <div className="text-center py-16">
          <FolderKanban className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Could not load projects. Make sure the API is running.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FolderKanban className="w-6 h-6 text-primary" />
          Projects
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Projects group memories around ongoing work.
        </p>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No projects yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Projects will be created as you organize your memories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
