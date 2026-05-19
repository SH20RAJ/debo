"use client";

import { ListTodo } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCard } from "./task-card";
import { ExtractedReview } from "./extracted-review";
import { TASKS } from "@/lib/mock";
import type { DeboTask } from "@/lib/types";

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

const inboxTasks = TASKS.filter((t) => t.status === "todo" || t.status === "doing");
const todayTasks = TASKS.filter((t) => isToday(t.dueDate) && t.status !== "done");
const upcomingTasks = TASKS.filter(
  (t) => t.dueDate && isThisWeek(t.dueDate) && t.status !== "done"
);
const completedTasks = TASKS.filter((t) => t.status === "done");

function TaskList({ tasks }: { tasks: DeboTask[] }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <ListTodo className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No tasks here yet.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Debo can detect tasks from journals, voice notes, and meetings.
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
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ListTodo className="w-6 h-6 text-primary" />
          Tasks
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Debo turns hidden commitments into visible tasks.
        </p>
      </div>

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
