"use client";

import { FolderKanban, CheckSquare, Database, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description: string;
  pinnedMemoryCount: number;
  openTaskCount: number;
  people: { initials: string; colorIdx: number }[];
}

const avatarColors = [
  "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
];

const mockProjects: Project[] = [
  {
    id: "debo",
    name: "Debo",
    description:
      "Private memory operating system. Multimodal intelligence lab for collaborative AI.",
    pinnedMemoryCount: 12,
    openTaskCount: 5,
    people: [
      { initials: "S", colorIdx: 0 },
      { initials: "R", colorIdx: 2 },
      { initials: "AC", colorIdx: 1 },
    ],
  },
  {
    id: "q4-budget",
    name: "Q4 Budget Planning",
    description:
      "Quarterly budget allocation review and finalization before the board meeting.",
    pinnedMemoryCount: 6,
    openTaskCount: 3,
    people: [
      { initials: "R", colorIdx: 2 },
      { initials: "PS", colorIdx: 3 },
    ],
  },
  {
    id: "landing-page",
    name: "Landing Page Revamp",
    description:
      "Redesign and rebuild the public landing page for the September preview launch.",
    pinnedMemoryCount: 4,
    openTaskCount: 2,
    people: [
      { initials: "AC", colorIdx: 1 },
      { initials: "S", colorIdx: 0 },
    ],
  },
];

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <FolderKanban className="w-4.5 h-4.5 text-primary" />
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
            <div
              key={i}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ring-2 ring-card",
                avatarColors[p.colorIdx % avatarColors.length]
              )}
            >
              {p.initials}
            </div>
          ))}
        </div>
      </div>
    </div>
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
      {mockProjects.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No projects yet.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Projects will be created as you organize your memories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mockProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
