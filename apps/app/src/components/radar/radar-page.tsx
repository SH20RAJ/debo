"use client";

import { useState } from "react";
import {
  Radar,
  User,
  Mail,
  MessageSquare,
  Mic,
  BookOpen,
  Clock,
  Reply,
  Bell,
  CheckCircle2,
  X,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RadarItem {
  id: string;
  title: string;
  reason: string;
  source: string;
  sourceIcon: React.ComponentType<{ className?: string }>;
  urgency: "today" | "this-week" | "later";
  dueLabel: string;
}

const mockRadarItems: RadarItem[] = [
  {
    id: "1",
    title: "Send Q4 budget to Raj",
    reason: "You promised this by Friday",
    source: "Voice note",
    sourceIcon: Mic,
    urgency: "today",
    dueLabel: "Today",
  },
  {
    id: "2",
    title: "Reply to Dev about landing page",
    reason: "Unread mail",
    source: "Debo Mail",
    sourceIcon: Mail,
    urgency: "today",
    dueLabel: "Today",
  },
  {
    id: "3",
    title: "Review landing page mockups",
    reason: "Task pending",
    source: "Chat",
    sourceIcon: MessageSquare,
    urgency: "this-week",
    dueLabel: "This week",
  },
  {
    id: "4",
    title: "Follow up with Sarah about investment",
    reason: "Mentioned in 2 sources",
    source: "Journal",
    sourceIcon: BookOpen,
    urgency: "this-week",
    dueLabel: "This week",
  },
  {
    id: "5",
    title: "Process 2 unreviewed voice notes",
    reason: "From last week",
    source: "Voice notes",
    sourceIcon: Mic,
    urgency: "later",
    dueLabel: "Next week",
  },
  {
    id: "6",
    title: "Update Debo architecture docs",
    reason: "Decision changed",
    source: "Meeting",
    sourceIcon: MessageSquare,
    urgency: "later",
    dueLabel: "Next week",
  },
];

const urgencyConfig = {
  today: {
    label: "Today",
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    dot: "bg-red-500",
  },
  "this-week": {
    label: "This week",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
  },
  later: {
    label: "Later",
    className: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground/40",
  },
};

function RadarItemCard({
  item,
  onDismiss,
}: {
  item: RadarItem;
  onDismiss: (id: string) => void;
}) {
  const config = urgencyConfig[item.urgency];
  const SourceIcon = item.sourceIcon;

  return (
    <div className="group flex items-start gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all hover:shadow-md">
      {/* Icon */}
      <div className="mt-0.5 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <User className="w-5 h-5 text-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground truncate">{item.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{item.reason}</p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
              config.className
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", config.dot)} />
            {config.label}
          </Badge>
        </div>

        {/* Source chip + Actions */}
        <div className="flex items-center justify-between mt-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted px-2 py-1 rounded-lg">
            <SourceIcon className="w-3 h-3" />
            {item.source}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground">
              <Reply className="w-3 h-3" />
              Draft reply
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground">
              <Bell className="w-3 h-3" />
              Remind
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-primary">
              <CheckCircle2 className="w-3 h-3" />
              Done
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDismiss(item.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RadarPage() {
  const [items, setItems] = useState<RadarItem[]>(mockRadarItems);

  const handleDismiss = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const todayItems = items.filter((i) => i.urgency === "today");
  const weekItems = items.filter((i) => i.urgency === "this-week");
  const laterItems = items.filter((i) => i.urgency === "later");

  const attentionItems = [...todayItems, ...weekItems];
  const upcomingItems = laterItems;

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Radar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Follow-Up Radar</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {attentionItems.length} item{attentionItems.length !== 1 ? "s" : ""} need
                {attentionItems.length === 1 ? "s" : ""} your attention
              </p>
            </div>
          </div>
          {todayItems.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                {todayItems.length} urgent
              </span>
            </div>
          )}
        </div>

        {/* Needs attention */}
        {attentionItems.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Needs attention
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-3">
              {attentionItems.map((item) => (
                <RadarItemCard key={item.id} item={item} onDismiss={handleDismiss} />
              ))}
            </div>
          </section>
        )}

        {/* Coming up */}
        {upcomingItems.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Coming up
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-3">
              {upcomingItems.map((item) => (
                <RadarItemCard key={item.id} item={item} onDismiss={handleDismiss} />
              ))}
            </div>
          </section>
        )}

        {items.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">All clear</h3>
            <p className="text-sm text-muted-foreground mt-1">No follow-ups pending. Nice work.</p>
          </div>
        )}
      </div>
    </div>
  );
}
