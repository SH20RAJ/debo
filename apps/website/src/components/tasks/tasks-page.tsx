"use client";

import { useEffect, useState } from "react";
import { ListTodo } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCard } from "./task-card";
import { ExtractedReview } from "./extracted-review";
import { api } from "@/lib/api";
import type { DeboTask } from "@/lib/types";

function normalizeTask(raw: any): DeboTask {
  return {
    id: raw.id ?? crypto.randomUUID(),
    title: raw.title ?? "Untitled task",
    status: raw.status ?? "todo",
    dueDate: raw.dueDate ?? raw.due_date,
    relatedPerson: raw.relatedPerson ?? raw.related_person,
    sourceId: raw.sourceId ?? raw.source_id,
    confidence: raw.confidence ?? "partial",
  };
}

function isToday(dateStr?: string) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isThisWeek(dateStr?: string) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
}

function TaskList({ tasks }: { tasks: DeboTask[] }) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-12 gap-3">
        <div className="size-10 rounded-xl bg-accent flex items-center justify-center">
          <ListTodo className="size-5 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground max-w-[32ch]">
          No tasks here yet. Debo detects tasks from journals, voice notes, and
          meetings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}

export function TasksPage() {
  const [tasks, setTasks] = useState<DeboTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchTasks() {
      try {
        const data = await api.tasks.list();
        const items = Array.isArray(data) ? data : data?.tasks ?? data?.data ?? [];
        if (!cancelled) {
          setTasks(items.map(normalizeTask));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }
    fetchTasks();
    return () => {
      cancelled = true;
    };
  }, []);

  const inboxTasks = tasks.filter(
    (t) => t.status === "todo" || t.status === "doing"
  );
  const todayTasks = tasks.filter(
    (t) => isToday(t.dueDate) && t.status !== "done"
  );
  const upcomingTasks = tasks.filter(
    (t) => t.dueDate && isThisWeek(t.dueDate) && t.status !== "done"
  );
  const completedTasks = tasks.filter((t) => t.status === "done");

  const header = (
    <div>
      <h1 className="text-2xl font-bold text-foreground font-[var(--font-nunito)]">
        Tasks
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Hidden commitments, made visible.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-5">
        {header}
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-border bg-card p-3 h-16 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-5">
        {header}
        <div className="flex flex-col items-center text-center py-16 gap-3">
          <div className="size-10 rounded-xl bg-accent flex items-center justify-center">
            <ListTodo className="size-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground max-w-[28ch]">
            Could not load tasks. Make sure the API is running.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-5">
      {header}

      <Tabs defaultValue="inbox">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="inbox">Inbox ({inboxTasks.length})</TabsTrigger>
          <TabsTrigger value="today">Today ({todayTasks.length})</TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="extracted">Extracted</TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-4">
          <TaskList tasks={inboxTasks} />
        </TabsContent>
        <TabsContent value="today" className="mt-4">
          <TaskList tasks={todayTasks} />
        </TabsContent>
        <TabsContent value="upcoming" className="mt-4">
          <TaskList tasks={upcomingTasks} />
        </TabsContent>
        <TabsContent value="extracted" className="mt-4">
          <ExtractedReview />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <TaskList tasks={completedTasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
