"use client";

import { useState, useMemo, useEffect } from "react";
import {
  CheckSquare,
  Users,
  Handshake,
  Lightbulb,
  Diamond,
  FileText,
  Mic,
  Mail,
  MessageSquare,
  Check,
  X,
  Pencil,
  Inbox,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

// --- Types ---

type ItemType = "task" | "person" | "promise" | "fact" | "decision";
type Confidence = "Strong" | "Partial" | "Weak";
type SourceType = "voice" | "journal" | "email" | "chat" | "meeting";

interface InboxItem {
  id: string;
  type: ItemType;
  content: string;
  source: SourceType;
  sourceLabel: string;
  confidence: Confidence;
}

// --- Config ---

const typeConfig: Record<
  ItemType,
  { icon: typeof CheckSquare; label: string; color: string; bg: string }
> = {
  task: {
    icon: CheckSquare,
    label: "Task",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  person: {
    icon: Users,
    label: "Person",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  promise: {
    icon: Handshake,
    label: "Promise",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  fact: {
    icon: Lightbulb,
    label: "Fact",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  decision: {
    icon: Diamond,
    label: "Decision",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
};

const sourceConfig: Record<SourceType, { icon: typeof FileText; label: string }> = {
  voice: { icon: Mic, label: "Voice note" },
  journal: { icon: FileText, label: "Journal" },
  email: { icon: Mail, label: "Email" },
  chat: { icon: MessageSquare, label: "Chat" },
  meeting: { icon: MessageSquare, label: "Meeting note" },
};

const confidenceStyles: Record<Confidence, string> = {
  Strong: "bg-emerald-100 text-emerald-700",
  Partial: "bg-amber-100 text-amber-700",
  Weak: "bg-zinc-100 text-zinc-500",
};

const filterTabs = ["All", "Tasks", "People", "Promises", "Facts", "Decisions"] as const;
type FilterTab = (typeof filterTabs)[number];

const filterToType: Record<string, ItemType | null> = {
  All: null,
  Tasks: "task",
  People: "person",
  Promises: "promise",
  Facts: "fact",
  Decisions: "decision",
};

// --- Mock Data ---

const initialItems: InboxItem[] = [];

// --- Component ---

export function MemoryInboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.tasks.list("inbox")
      .then((data: any) => {
        const tasks: any[] = data ?? [];
        const mapped: InboxItem[] = tasks.map((t: any) => ({
          id: t.id,
          type: "task" as ItemType,
          content: t.title || t.description || "Untitled",
          source: "journal" as SourceType,
          sourceLabel: "Inbox",
          confidence: ("Strong" as Confidence),
        }));
        setItems(mapped);
        setApproved(new Set());
        setDismissed(new Set());
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const pendingItems = useMemo(
    () =>
      items.filter(
        (item) => !approved.has(item.id) && !dismissed.has(item.id)
      ),
    [items, approved, dismissed]
  );

  const approvedItems = useMemo(
    () => items.filter((item) => approved.has(item.id)),
    [items, approved]
  );

  const filteredPending = useMemo(() => {
    const typeFilter = filterToType[activeFilter];
    if (!typeFilter) return pendingItems;
    return pendingItems.filter((item) => item.type === typeFilter);
  }, [pendingItems, activeFilter]);

  const stats = useMemo(() => {
    const counts: Record<ItemType, number> = {
      task: 0,
      person: 0,
      promise: 0,
      fact: 0,
      decision: 0,
    };
    pendingItems.forEach((item) => counts[item.type]++);
    return counts;
  }, [pendingItems]);

  const handleApprove = async (id: string) => {
    try {
      await api.tasks.approve(id);
      setApproved((prev) => new Set(prev).add(id));
    } catch {
      // ignore
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await api.tasks.dismiss(id);
      setDismissed((prev) => new Set(prev).add(id));
    } catch {
      // ignore
    }
  };

  const totalCount = pendingItems.length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <Inbox className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground">
                Memory Inbox
              </h1>
              <p className="text-sm text-muted-foreground">
                Review items Debo extracted from your memories
              </p>
            </div>
            {totalCount > 0 && (
              <Badge
                variant="default"
                className="ml-auto h-6 px-2.5 text-xs font-semibold"
              >
                {totalCount} pending
              </Badge>
            )}
          </div>
        </div>

        {/* Stats bar */}
        {totalCount > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {(["task", "person", "promise", "fact", "decision"] as ItemType[]).map(
              (type) => {
                if (stats[type] === 0) return null;
                const conf = typeConfig[type];
                return (
                  <span key={type} className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          type === "task"
                            ? "#3b82f6"
                            : type === "person"
                            ? "#8b5cf6"
                            : type === "promise"
                            ? "#f59e0b"
                            : type === "fact"
                            ? "#10b981"
                            : "#f43f5e",
                      }}
                    />
                    {stats[type]} {conf.label}
                    {stats[type] !== 1 ? "s" : ""}
                  </span>
                );
              }
            )}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={cn(
                  "flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
                  isActive
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Pending items */}
        {filteredPending.length > 0 ? (
          <div className="space-y-3">
            {filteredPending.map((item) => (
              <InboxItemCard
                key={item.id}
                item={item}
                onApprove={() => handleApprove(item.id)}
                onDismiss={() => handleDismiss(item.id)}
              />
            ))}
          </div>
        ) : totalCount === 0 ? (
          /* Empty state - all reviewed */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-1">
              All caught up!
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Debo has nothing new for you to review. New items will appear here
              as your memories are processed.
            </p>
          </div>
        ) : (
          /* Filtered to empty but there are pending items */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No {activeFilter.toLowerCase()} to review right now.
            </p>
          </div>
        )}

        {/* Approved section */}
        {approvedItems.length > 0 && (
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span className="font-medium">
                {approvedItems.length} approved
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-2 opacity-60">
              {approvedItems.map((item) => {
                const conf = typeConfig[item.type];
                const Icon = conf.icon;
                const src = sourceConfig[item.source];
                const SrcIcon = src.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5",
                        conf.bg
                      )}
                    >
                      <Icon className={cn("w-4 h-4", conf.color)} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm text-foreground line-through decoration-muted-foreground/40">
                        {item.content}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <SrcIcon className="w-3 h-3" />
                          {src.label} &middot; {item.sourceLabel}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary font-medium shrink-0">
                      <Check className="w-3.5 h-3.5" />
                      Approved
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Item Card ---

function InboxItemCard({
  item,
  onApprove,
  onDismiss,
}: {
  item: InboxItem;
  onApprove: () => void;
  onDismiss: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.content);

  const conf = typeConfig[item.type];
  const Icon = conf.icon;
  const src = sourceConfig[item.source];
  const SrcIcon = src.icon;

  return (
    <Card className="p-0 border border-border shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        {/* Type icon */}
        <div
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-xl shrink-0",
            conf.bg
          )}
        >
          <Icon className={cn("w-[18px] h-[18px]", conf.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className={cn(
                "h-5 px-2 text-[10px] font-semibold rounded-md",
                conf.bg,
                conf.color
              )}
            >
              {conf.label}
            </Badge>
            <span
              className={cn(
                "inline-flex items-center h-5 px-2 rounded-md text-[10px] font-medium",
                confidenceStyles[item.confidence]
              )}
            >
              {item.confidence}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full text-sm text-foreground bg-muted rounded-lg p-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="h-7 text-xs rounded-lg"
                  onClick={() => {
                    item.content = editValue;
                    setIsEditing(false);
                  }}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs rounded-lg"
                  onClick={() => {
                    setEditValue(item.content);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground leading-relaxed">
              {item.content}
            </p>
          )}

          {/* Source chip */}
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-md px-2 py-1">
            <SrcIcon className="w-3 h-3" />
            {src.label} &middot; {item.sourceLabel}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 pb-4 pt-0">
        <Button
          size="sm"
          className="h-8 text-xs rounded-lg bg-[#58CC02] hover:bg-[#4cad02] text-white shadow-[0_2px_0_#46a302] font-semibold"
          onClick={onApprove}
        >
          <Check className="w-3.5 h-3.5 mr-1" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs rounded-lg font-medium"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="w-3.5 h-3.5 mr-1" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs rounded-lg text-muted-foreground hover:text-foreground font-medium"
          onClick={onDismiss}
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Dismiss
        </Button>
      </div>
    </Card>
  );
}
