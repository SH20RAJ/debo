"use client";

import { FolderKanban, CheckSquare, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PROJECTS } from "@/lib/mock";

const avatarColors = [
  "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
];

function ProjectCard({ project }: { project: typeof PROJECTS[number] }) {
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
              {project.pinnedMemoryCount} memories
            </span>
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3" />
              {project.openTaskCount} task{project.openTaskCount !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex -space-x-1.5">
            {project.people.map((p, i) => (
              <Avatar key={i} size="sm" className="ring-2 ring-card">
                <AvatarFallback className={cn("text-[9px] font-bold", avatarColors[p.colorIdx % avatarColors.length])}>
                  {p.initials}
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
      {PROJECTS.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No projects yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Projects will be created as you organize your memories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
