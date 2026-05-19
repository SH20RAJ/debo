"use client";

import { useState } from "react";
import {
  Mic,
  BookOpen,
  CheckSquare,
  Users,
  FileText,
  Diamond,
  Mail,
  ExternalLink,
  MessageCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type TimeRange = "today" | "week" | "month";

type MemoryType =
  | "voice"
  | "journal"
  | "task"
  | "person"
  | "file"
  | "decision"
  | "mail";

interface TimelineItem {
  id: string;
  type: MemoryType;
  summary: string;
  detail: string;
  time: string;
  sourceChip?: string;
  people?: string[];
  projects?: string[];
}

interface DayGroup {
  date: string;
  label: string;
  items: TimelineItem[];
}

const typeConfig: Record<
  MemoryType,
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }
> = {
  voice: {
    icon: Mic,
    color: "text-purple-600",
    bg: "bg-purple-100",
    label: "Voice note",
  },
  journal: {
    icon: BookOpen,
    color: "text-blue-600",
    bg: "bg-blue-100",
    label: "Journal",
  },
  task: {
    icon: CheckSquare,
    color: "text-green-600",
    bg: "bg-green-100",
    label: "Task created",
  },
  person: {
    icon: Users,
    color: "text-orange-500",
    bg: "bg-orange-100",
    label: "Person mentioned",
  },
  file: {
    icon: FileText,
    color: "text-gray-500",
    bg: "bg-gray-100",
    label: "File uploaded",
  },
  decision: {
    icon: Diamond,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    label: "Decision made",
  },
  mail: {
    icon: Mail,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "Mail received",
  },
};

const mockData: DayGroup[] = [
  {
    date: "2026-05-19",
    label: "Today",
    items: [
      {
        id: "1",
        type: "mail",
        summary: "Q4 budget follow-up",
        detail: "from raj@debo.life",
        time: "10:30 AM",
        sourceChip: "Debo Mail",
      },
      {
        id: "2",
        type: "voice",
        summary: "Marketing sync follow-up",
        detail: "discussed Q4 allocation",
        time: "9:15 AM",
        sourceChip: "Voice",
      },
      {
        id: "3",
        type: "task",
        summary: "Send Q4 budget to Raj by Friday",
        detail: "",
        time: "8:00 AM",
        sourceChip: "Tasks",
        people: ["Raj"],
      },
    ],
  },
  {
    date: "2026-05-18",
    label: "Yesterday",
    items: [
      {
        id: "4",
        type: "journal",
        summary: "Debo product ideas",
        detail: "wrote about memory-first architecture",
        time: "3:00 PM",
        sourceChip: "Journal",
        projects: ["Debo"],
      },
      {
        id: "5",
        type: "person",
        summary: "Dev",
        detail: "discussed landing page redesign",
        time: "2:30 PM",
        people: ["Dev"],
      },
      {
        id: "6",
        type: "decision",
        summary: "Use R2 for storage",
        detail: "from backend planning",
        time: "11:00 AM",
        sourceChip: "Decision",
        projects: ["Debo"],
      },
      {
        id: "7",
        type: "file",
        summary: "Q4 Allocation Draft.pdf",
        detail: "",
        time: "9:00 AM",
        sourceChip: "Upload",
      },
    ],
  },
  {
    date: "2026-05-17",
    label: "May 17",
    items: [
      {
        id: "8",
        type: "voice",
        summary: "Quick thought on Debo pricing",
        detail: "explored freemium model",
        time: "4:00 PM",
        sourceChip: "Voice",
        projects: ["Debo"],
      },
      {
        id: "9",
        type: "decision",
        summary: "Use BlockNote for editor",
        detail: "from tech research",
        time: "2:00 PM",
        sourceChip: "Decision",
      },
      {
        id: "10",
        type: "journal",
        summary: "Weekly reflection",
        detail: "reviewed progress",
        time: "10:00 AM",
        sourceChip: "Journal",
      },
    ],
  },
  {
    date: "2026-05-16",
    label: "May 16",
    items: [
      {
        id: "11",
        type: "person",
        summary: "Raj",
        detail: "Q4 budget planning",
        time: "5:00 PM",
        people: ["Raj"],
      },
      {
        id: "12",
        type: "task",
        summary: "Review competitor analysis",
        detail: "",
        time: "11:00 AM",
        sourceChip: "Tasks",
      },
    ],
  },
];

function TimelineItemCard({ item }: { item: TimelineItem }) {
  const config = typeConfig[item.type];
  const Icon = config.icon;

  return (
    <div className="relative flex gap-4 group">
      {/* Dot on the timeline */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            config.bg
          )}
        >
          <Icon className={cn("w-[18px] h-[18px]", config.color)} />
        </div>
      </div>

      {/* Card */}
      <Card className="flex-1 p-4 rounded-xl border-border/50 hover:border-primary/20 transition-all hover:shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-xs font-medium", config.color)}>
                {config.label}
              </span>
              {item.sourceChip && (
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-[10px] font-normal"
                >
                  {item.sourceChip}
                </Badge>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {item.summary}
            </p>
            {item.detail && (
              <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
            )}
            {/* Chips */}
            {(item.people?.length || item.projects?.length) && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.people?.map((p) => (
                  <Badge
                    key={p}
                    variant="outline"
                    className="h-5 px-1.5 text-[10px] font-normal border-orange-200 text-orange-600 bg-orange-50"
                  >
                    <Users className="w-2.5 h-2.5 mr-1" />
                    {p}
                  </Badge>
                ))}
                {item.projects?.map((p) => (
                  <Badge
                    key={p}
                    variant="outline"
                    className="h-5 px-1.5 text-[10px] font-normal border-primary/20 text-primary bg-primary/5"
                  >
                    {p}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {item.time}
            </span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title="Open source"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title="Ask about this"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DaySection({ day }: { day: DayGroup }) {
  return (
    <div className="relative">
      {/* Date header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">{day.label}</h3>
          <span className="text-xs text-muted-foreground">{day.date}</span>
        </div>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Items */}
      <div className="relative pl-5">
        {/* Vertical connecting line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-primary/20" />

        <div className="space-y-4">
          {day.items.map((item) => (
            <TimelineItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TimelinePage() {
  const [range, setRange] = useState<TimeRange>("week");

  const ranges: { value: TimeRange; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ];

  const data = mockData;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="w-[18px] h-[18px] text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground font-heading">
              Memory Timeline
            </h1>
            <p className="text-xs text-muted-foreground">
              Your memories, chronologically
            </p>
          </div>
        </div>

        {/* Range selector */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                range === r.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {data.length > 0 ? (
          <div className="max-w-2xl mx-auto space-y-8">
            {data.map((day) => (
              <DaySection key={day.date} day={day} />
            ))}

            {/* End marker */}
            <div className="flex items-center justify-center gap-2 py-8">
              <div className="w-2 h-2 rounded-full bg-primary/30" />
              <span className="text-xs text-muted-foreground">
                Your memory timeline will grow as you capture more.
              </span>
              <div className="w-2 h-2 rounded-full bg-primary/30" />
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              No memories yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your memory timeline will grow as you capture more.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
