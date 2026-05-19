"use client";

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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const memories = [
  { icon: Mic, label: "Voice note: Marketing sync with Raj", time: "9:30 AM" },
  { icon: FileText, label: "Journal: Debo product ideas", time: "11:00 AM" },
  { icon: Brain, label: "Decision: Use R2 for storage", time: "2:15 PM" },
  { icon: Mail, label: "Mail: Q4 budget follow-up from raj@debo.life", time: "4:00 PM" },
];

const tasks = [
  { label: "Send Q4 budget to Raj by Friday", status: "created" as const },
  { label: "Review landing page mockups", status: "created" as const },
  { label: "Set up Debo Mail", status: "completed" as const },
];

const people = [
  { name: "Raj", mentions: 3, context: "Q4 budget planning" },
  { name: "Dev", mentions: 1, context: "Landing page redesign" },
];

const openLoops = [
  "You promised Raj the budget by Friday",
  "2 unreviewed voice notes from this week",
];

const tomorrowSuggestions = [
  "Follow up with Raj on budget",
  "Review Dev's landing page ideas",
  "Process 2 unreviewed voice notes",
];

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
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-heading font-bold tracking-tight">
          Daily Debrief
        </h1>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" />
          {today}
        </p>
      </div>

      {/* What happened today */}
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

      {/* Tasks */}
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

      {/* People */}
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

      {/* Open loops */}
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

      {/* Start tomorrow with */}
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
          {tomorrowSuggestions.map((s, i) => (
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
    </div>
  );
}
