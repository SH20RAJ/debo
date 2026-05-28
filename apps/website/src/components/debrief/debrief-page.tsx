"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Mail,
  Mic,
  Sparkles,
  User,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

interface MemoryItem {
  icon: typeof Mic;
  label: string;
  time: string;
}

interface TaskItem {
  label: string;
  status: "created" | "completed";
}

interface PersonItem {
  name: string;
  mentions: number;
  context: string;
}

function SectionCard({
  title,
  icon: Icon,
  count,
  gradient,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  gradient: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("border-0 shadow-none overflow-hidden", gradient)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-foreground/70" />
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          </div>
          <Badge
            variant="secondary"
            className="h-5 px-1.5 text-[10px] bg-background/60 backdrop-blur-sm"
          >
            {count}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">{children}</CardContent>
    </Card>
  );
}

export function DebriefPage() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [people, setPeople] = useState<PersonItem[]>([]);
  const [openLoops, setOpenLoops] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.sources.list().catch(() => [] as any[]),
      api.tasks.list().catch(() => [] as any[]),
      api.people.list().catch(() => [] as any[]),
    ])
      .then(([sources, tasksData, peopleData]) => {
        const todayStr = new Date().toISOString().split("T")[0];

        const todaySources = (sources ?? []).filter(
          (s: any) => s.createdAt?.startsWith(todayStr)
        );
        setMemories(
          todaySources.slice(0, 4).map((s: any) => ({
            icon: s.type === "voice" || s.type === "audio" ? Mic
              : s.type === "journal" ? FileText
              : s.type === "debo_mail" || s.type === "email" ? Mail
              : Brain,
            label: `${s.type || "source"}: ${s.title || "Untitled"}`,
            time: s.createdAt
              ? new Date(s.createdAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "",
          }))
        );

        const todos = (tasksData ?? []).filter(
          (t: any) => t.status === "todo" || t.status === "inbox"
        );
        const completed = (tasksData ?? []).filter(
          (t: any) => t.status === "done"
        );
        setTasks([
          ...todos.slice(0, 5).map((t: any) => ({
            label: t.title || "Task",
            status: "created" as const,
          })),
          ...completed.slice(0, 2).map((t: any) => ({
            label: t.title || "Task",
            status: "completed" as const,
          })),
        ]);
        setOpenLoops(
          todos.slice(0, 3).map((t: any) => t.title || t.description || "Untitled")
        );
        setPeople(
          (peopleData ?? []).slice(0, 3).map((p: any) => ({
            name: p.name || "Unknown",
            mentions: p.mentionCount ?? 1,
            context: p.relationship || "",
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Building your debrief...
      </div>
    );
  }

  const hasMemories = memories.length > 0;
  const hasTasks = tasks.length > 0;
  const hasPeople = people.length > 0;
  const hasLoops = openLoops.length > 0;
  const hasData = hasMemories || hasTasks || hasPeople || hasLoops;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-heading font-bold tracking-tight">
          Daily Debrief
        </h1>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" />
          {today}
        </p>
      </div>

      {!hasData && (
        <div className="text-center py-12">
          <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Nothing to debrief yet. Start capturing memories!
          </p>
        </div>
      )}

      {hasMemories && (
        <SectionCard
          title="What happened today"
          icon={Clock}
          count={memories.length}
          gradient="bg-gradient-to-br from-primary/5 to-primary/10"
        >
          {memories.map((m, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-background/60 backdrop-blur-sm"
            >
              <m.icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm flex-1">{m.label}</span>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                {m.time}
              </span>
            </div>
          ))}
        </SectionCard>
      )}

      {hasTasks && (
        <SectionCard
          title="Tasks"
          icon={CheckCircle2}
          count={tasks.length}
          gradient="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10"
        >
          {tasks.map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-background/60 backdrop-blur-sm"
            >
              {t.status === "completed" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <span
                className={cn(
                  "text-sm flex-1",
                  t.status === "completed" &&
                    "line-through text-muted-foreground"
                )}
              >
                {t.label}
              </span>
              <Badge
                variant="secondary"
                className={cn(
                  "h-5 px-1.5 text-[10px]",
                  t.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-amber-500/10 text-amber-600"
                )}
              >
                {t.status}
              </Badge>
            </div>
          ))}
        </SectionCard>
      )}

      {hasPeople && (
        <SectionCard
          title="People"
          icon={User}
          count={people.length}
          gradient="bg-gradient-to-br from-violet-500/5 to-violet-500/10"
        >
          {people.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-background/60 backdrop-blur-sm"
            >
              <div className="w-7 h-7 rounded-full bg-violet-500/15 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-violet-600">
                  {p.name[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-[11px] text-muted-foreground">{p.context}</p>
              </div>
              <Badge
                variant="secondary"
                className="h-5 px-1.5 text-[10px] bg-violet-500/10 text-violet-600"
              >
                {p.mentions}x
              </Badge>
            </div>
          ))}
        </SectionCard>
      )}

      {hasLoops && (
        <SectionCard
          title="Open loops"
          icon={Sparkles}
          count={openLoops.length}
          gradient="bg-gradient-to-br from-amber-500/5 to-amber-500/10"
        >
          {openLoops.map((loop, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-background/60 backdrop-blur-sm"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span className="text-sm">{loop}</span>
            </div>
          ))}
        </SectionCard>
      )}

      {hasTasks && (
        <Card className="border-0 shadow-none bg-gradient-to-br from-sky-500/5 to-sky-500/10 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-foreground/70" />
              <CardTitle className="text-sm font-semibold">
                Start tomorrow with
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {openLoops.slice(0, 3).map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-background/60 backdrop-blur-sm"
              >
                <ArrowRight className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span className="text-sm">{s}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
