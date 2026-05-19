"use client";

import { useState } from "react";
import { Inbox, Sun, CalendarDays, Sparkles, CheckCircle2, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskCard, type Task } from "./task-card";
import { ExtractedReview } from "./extracted-review";

const mockTasks: Task[] = [
  {
    id: "t1",
    title: "Send finalized Q4 budget to Raj",
    status: "todo",
    dueDate: "Friday",
    relatedPerson: "Raj",
    source: "Marketing Sync",
    sourceType: "voice",
    confidence: "strong",
  },
  {
    id: "t2",
    title: "Follow up with Sarah about API integration",
    status: "todo",
    relatedPerson: "Sarah",
    source: "Customer Call",
    sourceType: "meeting",
    confidence: "partial",
  },
  {
    id: "t3",
    title: "Review landing page designs",
    status: "doing",
    source: "Product Ideas journal",
    sourceType: "journal",
    confidence: "strong",
  },
  {
    id: "t4",
    title: "Prepare investor deck",
    status: "todo",
    dueDate: "Next week",
    source: "Meeting Notes",
    sourceType: "meeting",
    confidence: "strong",
  },
  {
    id: "t5",
    title: "Draft blog post on memory OS",
    status: "todo",
    source: "Weekly Review",
    sourceType: "journal",
    confidence: "partial",
  },
  {
    id: "t6",
    title: "Set up Stripe webhook for billing",
    status: "done",
    source: "Sprint Planning",
    sourceType: "meeting",
    confidence: "strong",
  },
];

type Tab = "inbox" | "today" | "upcoming" | "extracted" | "completed";

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "today", label: "Today", icon: Sun },
  { id: "upcoming", label: "Upcoming", icon: CalendarDays },
  { id: "extracted", label: "Extracted", icon: Sparkles },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
];

export function TasksPage() {
  const [activeTab, setActiveTab] = useState<Tab>("inbox");

  const inboxTasks = mockTasks.filter((t) => t.status === "todo");
  const todayTasks = mockTasks.filter(
    (t) => t.dueDate === "Today" || t.dueDate === "Friday"
  );
  const upcomingTasks = mockTasks.filter(
    (t) => t.dueDate && t.status !== "done"
  );
  const completedTasks = mockTasks.filter((t) => t.status === "done");

  function getTasksForTab(): Task[] {
    switch (activeTab) {
      case "inbox":
        return inboxTasks;
      case "today":
        return todayTasks;
      case "upcoming":
        return upcomingTasks;
      case "completed":
        return completedTasks;
      default:
        return [];
    }
  }

  const tasks = getTasksForTab();

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ListTodo className="w-6 h-6 text-primary" />
          Tasks
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Debo turns hidden commitments into visible tasks.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Extracted Review */}
      {activeTab === "extracted" && <ExtractedReview />}

      {/* Task List */}
      {activeTab !== "extracted" && (
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-16">
              <ListTodo className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No tasks here yet.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Debo can detect tasks from journals, voice notes, and meetings.
              </p>
            </div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      )}
    </div>
  );
}
