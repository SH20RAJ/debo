"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
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
  Sparkles,
  Loader2,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

// --- Types ---

type ItemType = "task" | "person" | "promise" | "fact" | "decision";
type Confidence = "Strong" | "Partial" | "Weak";
type SourceType = "voice" | "journal" | "email" | "chat" | "meeting" | "debo_mail";

interface InboxItem {
  id: string;
  table: "tasks" | "memory_items";
  type: ItemType;
  content: string;
  source: SourceType;
  sourceLabel: string;
  confidence: Confidence;
  createdAt: string;
}

const typeConfig: Record<
  ItemType,
  { icon: typeof CheckSquare; label: string }
> = {
  task: { icon: CheckSquare, label: "Task" },
  person: { icon: Users, label: "Person" },
  promise: { icon: Handshake, label: "Promise" },
  fact: { icon: Lightbulb, label: "Fact" },
  decision: { icon: Diamond, label: "Decision" },
};

const sourceConfig: Record<SourceType, { icon: typeof FileText; label: string }> = {
  voice: { icon: Mic, label: "Voice note" },
  journal: { icon: FileText, label: "Journal" },
  email: { icon: Mail, label: "Email" },
  debo_mail: { icon: Mail, label: "Debo Mail" },
  chat: { icon: MessageSquare, label: "Chat" },
  meeting: { icon: MessageSquare, label: "Meeting" },
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

export function MemoryInboxPage() {
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  const { data: items = [], error, mutate, isLoading } = useSWR<InboxItem[]>("/api/inbox", () => api.inbox.list());

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

  const handleApprove = async (id: string, table: "tasks" | "memory_items") => {
    try {
      await api.inbox.approve(id, table);
      setApproved((prev) => new Set(prev).add(id));
      mutate();
    } catch (err) {
      console.error("Approve failed", err);
    }
  };

  const handleDismiss = async (id: string, table: "tasks" | "memory_items") => {
    try {
      await api.inbox.dismiss(id, table);
      setDismissed((prev) => new Set(prev).add(id));
      mutate();
    } catch (err) {
      console.error("Dismiss failed", err);
    }
  };

  const handleUpdateContent = async (id: string, table: "tasks" | "memory_items", newContent: string) => {
    try {
      await api.inbox.update(id, table, newContent);
      mutate();
    } catch (err) {
      console.error("Edit failed", err);
    }
  };

  const totalCount = pendingItems.length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-[var(--font-nunito)]">
              Memory Inbox
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review what Debo extracted from your memories.
            </p>
          </div>
          {totalCount > 0 && (
            <Badge className="ml-auto rounded-full bg-primary text-primary-foreground border-0 text-[11px] px-2.5 h-6">
              {totalCount} pending
            </Badge>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={cn(
                  "flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
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
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-10">
            <Loader2 className="size-4 animate-spin text-primary" />
            Loading inbox...
          </div>
        ) : filteredPending.length > 0 ? (
          <div className="space-y-2">
            {filteredPending.map((item) => (
              <InboxItemCard
                key={item.id}
                item={item}
                onApprove={() => handleApprove(item.id, item.table)}
                onDismiss={() => handleDismiss(item.id, item.table)}
                onUpdate={(newContent) => handleUpdateContent(item.id, item.table, newContent)}
              />
            ))}
          </div>
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="size-10 rounded-xl bg-accent flex items-center justify-center">
              <Sparkles className="size-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground max-w-[24ch]">
              All caught up. New extractions will appear here as your memories
              are processed.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-xs text-muted-foreground">
              No {activeFilter.toLowerCase()} to review right now.
            </p>
          </div>
        )}

        {/* Approved section */}
        {approvedItems.length > 0 && (
          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="size-3.5 text-primary" />
              <span className="font-semibold">
                {approvedItems.length} approved
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-2 opacity-60">
              {approvedItems.map((item) => {
                const conf = typeConfig[item.type];
                const Icon = conf?.icon || CheckSquare;
                const src = sourceConfig[item.source] || { icon: FileText, label: "Source" };
                const SrcIcon = src.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-card border-2 border-border"
                  >
                    <div className="size-8 rounded-xl bg-accent flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm text-foreground line-through decoration-muted-foreground/40">
                        {item.content}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <SrcIcon className="size-3" />
                        {src.label} · {item.sourceLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary font-semibold shrink-0">
                      <Check className="size-3.5" />
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
  onUpdate,
}: {
  item: InboxItem;
  onApprove: () => void;
  onDismiss: () => void;
  onUpdate: (newContent: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.content);

  const conf = typeConfig[item.type] || { icon: CheckSquare, label: "Extraction" };
  const Icon = conf.icon;
  const src = sourceConfig[item.source] || { icon: FileText, label: "Source" };
  const SrcIcon = src.icon;

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
          <Icon className="size-4 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="rounded-full text-[10px] px-2 py-0 h-5 font-semibold border-border"
            >
              {conf.label}
            </Badge>
            <span className="inline-flex items-center text-[10px] font-semibold text-muted-foreground">
              {item.confidence}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full text-sm text-foreground bg-muted rounded-xl p-2.5 border-2 border-border focus:outline-none focus:border-primary/50 resize-none animate-in fade-in duration-250"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2 animate-in fade-in duration-200">
                <Button
                  size="xs"
                  className="rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-3 py-1"
                  onClick={async () => {
                    await onUpdate(editValue);
                    setIsEditing(false);
                  }}
                >
                  Save
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  className="rounded-lg border border-white/5 font-semibold px-3 py-1 hover:bg-white/5"
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
            <p className="text-sm text-foreground leading-snug">{item.content}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <SrcIcon className="size-3" />
              {src.label} · {item.sourceLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3 text-zinc-600" />
              {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 pt-1">
            <Button
              size="xs"
              className={cn(
                "rounded-lg gap-1 bg-primary text-primary-foreground font-semibold px-3 h-7",
                "shadow-[0_3px_0_#46A302] hover:brightness-105",
                "active:translate-y-[2px] active:shadow-none transition-all"
              )}
              onClick={onApprove}
            >
              <Check className="size-3" />
              Approve
            </Button>
            <Button
              size="xs"
              variant="ghost"
              className="rounded-lg gap-1 text-muted-foreground hover:text-foreground hover:bg-accent/60 h-7"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="size-3" />
              Edit
            </Button>
            <Button
              size="xs"
              variant="ghost"
              className="rounded-lg gap-1 text-muted-foreground hover:text-foreground hover:bg-accent/60 h-7"
              onClick={onDismiss}
            >
              <X className="size-3" />
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
