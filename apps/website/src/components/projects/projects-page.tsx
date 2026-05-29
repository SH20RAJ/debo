"use client";

import { useEffect, useState } from "react";
import { FolderKanban, CheckSquare, Database } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <div
      className={cn(
        "rounded-2xl border-2 border-border bg-card p-4 h-full",
        "transition-colors hover:border-primary/30 cursor-pointer group"
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <FolderKanban className="size-4" />
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

      <div className="flex items-center justify-between pt-2.5 border-t border-border">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Database className="size-3" />
            {project.pinnedMemories}
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckSquare className="size-3" />
            {project.openTasks} task{project.openTasks !== 1 ? "s" : ""}
          </span>
        </div>

        {project.people.length > 0 && (
          <div className="flex -space-x-1.5">
            {project.people.slice(0, 4).map((name, i) => (
              <Avatar key={i} className="ring-2 ring-card w-6 h-6">
                <AvatarFallback
                  className={cn(
                    "text-[9px] font-bold",
                    avatarColors[i % avatarColors.length]
                  )}
                >
                  {name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        )}
      </div>
    </div>
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
    return () => {
      cancelled = true;
    };
  }, []);

  const header = (
    <div>
      <h1 className="text-2xl font-bold text-foreground font-[var(--font-nunito)]">
        Projects
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Threads of work pulled from your memories.
      </p>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-5">
      {header}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-border bg-card p-4 h-28 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center text-center py-16 gap-3">
          <div className="size-10 rounded-xl bg-accent flex items-center justify-center">
            <FolderKanban className="size-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground max-w-[28ch]">
            Could not load projects. Make sure the API is running.
          </p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16 gap-3">
          <div className="size-10 rounded-xl bg-accent flex items-center justify-center">
            <FolderKanban className="size-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground max-w-[28ch]">
            Projects will appear here as you organize your memories.
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
