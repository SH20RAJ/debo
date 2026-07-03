"use client";

import { useState, useEffect } from "react";
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
 Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

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
 {
 icon: React.ComponentType<{ className?: string }>;
 label: string;
 }
> = {
 voice: { icon: Mic, label: "Voice note" },
 journal: { icon: BookOpen, label: "Journal" },
 task: { icon: CheckSquare, label: "Task" },
 person: { icon: Users, label: "Person mentioned" },
 file: { icon: FileText, label: "File" },
 decision: { icon: Diamond, label: "Decision" },
 mail: { icon: Mail, label: "Mail" },
};

function fetchTimelineData(range: TimeRange): Promise<DayGroup[]> {
 return Promise.all([
 api.sources.list(),
 api.tasks.list(),
 api.people.list(),
 ]).then(([sources, tasks, people]) => {
 const now = new Date();
 const rangeDays = range === "today" ? 1 : range === "week" ? 7 : 30;
 const cutoff = new Date(now.getTime() - rangeDays * 86400000);

 const items: TimelineItem[] = [];

 for (const s of (sources ?? []) as any[]) {
 const createdAt = new Date(s.createdAt);
 if (createdAt < cutoff) continue;
 const type: MemoryType =
 s.type === "voice" || s.type === "audio"
 ? "voice"
 : s.type === "journal"
 ? "journal"
 : s.type === "file" || s.type === "image"
 ? "file"
 : s.type === "debo_mail" || s.type === "email"
 ? "mail"
 : "journal";
 items.push({
 id: s.id,
 type,
 summary: s.title || typeConfig[type].label,
 detail: s.description || "",
 time: createdAt.toLocaleTimeString("en-US", {
 hour: "numeric",
 minute: "2-digit",
 }),
 sourceChip: typeConfig[type].label,
 projects: s.projectId ? [s.projectId] : undefined,
 });
 }

 for (const t of (tasks ?? []) as any[]) {
 const createdAt = new Date(t.createdAt);
 if (createdAt < cutoff) continue;
 items.push({
 id: t.id,
 type: "task",
 summary: t.title || "Task",
 detail: t.description || "",
 time: createdAt.toLocaleTimeString("en-US", {
 hour: "numeric",
 minute: "2-digit",
 }),
 sourceChip: "Tasks",
 people: t.relatedPersonId ? [t.relatedPersonId] : undefined,
 });
 }

 for (const p of (people ?? []) as any[]) {
 const createdAt = new Date(p.createdAt);
 if (createdAt < cutoff) continue;
 items.push({
 id: p.id,
 type: "person",
 summary: p.name || "Person",
 detail: p.relationship || "",
 time: createdAt.toLocaleTimeString("en-US", {
 hour: "numeric",
 minute: "2-digit",
 }),
 sourceChip: "People",
 people: [p.name],
 });
 }

 items.sort((a, b) => {
 const timeA = new Date(`1970-01-01T${a.time}`).getTime();
 const timeB = new Date(`1970-01-01T${b.time}`).getTime();
 return timeB - timeA;
 });

 const groups: Record<string, TimelineItem[]> = {};
 for (const item of items) {
 const label = "Today";
 if (!groups[label]) groups[label] = [];
 groups[label].push(item);
 }

 return Object.entries(groups).map(([label, groupItems]) => ({
 date: new Date().toISOString().split("T")[0],
 label,
 items: groupItems,
 }));
 });
}

function TimelineItemCard({
 item,
 onOpenSource,
 onAskAbout,
}: {
 item: TimelineItem;
 onOpenSource: (item: TimelineItem) => void;
 onAskAbout: (item: TimelineItem) => void;
}) {
 const config = typeConfig[item.type];
 const Icon = config.icon;

 return (
 <div className="relative flex gap-3 group">
 <div className="relative z-10 flex-shrink-0">
 <div className="size-9 rounded-xl bg-accent flex items-center justify-center">
 <Icon className="size-4 text-muted-foreground" />
 </div>
 </div>

 <div className="flex-1 rounded-2xl border-2 border-border bg-card p-3 transition-colors hover:border-primary/30">
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
 {config.label}
 </span>
 {item.sourceChip && item.sourceChip !== config.label && (
 <Badge
 variant="outline"
 className="rounded-full h-4 px-1.5 text-[10px] border-border"
 >
 {item.sourceChip}
 </Badge>
 )}
 </div>
 <p className="text-sm font-semibold text-foreground leading-tight">
 {item.summary}
 </p>
 {item.detail && (
 <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
 {item.detail}
 </p>
 )}
 {(item.people?.length || item.projects?.length) && (
 <div className="flex flex-wrap gap-1.5 mt-2">
 {item.people?.map((p) => (
 <Badge
 key={p}
 variant="outline"
 className="rounded-full h-4 px-1.5 text-[10px] border-border text-muted-foreground"
 >
 <Users className="size-2.5 mr-1" />
 {p}
 </Badge>
 ))}
 {item.projects?.map((p) => (
 <Badge
 key={p}
 variant="outline"
 className="rounded-full h-4 px-1.5 text-[10px] border-primary/20 text-primary bg-primary/5"
 >
 {p}
 </Badge>
 ))}
 </div>
 )}
 </div>

 <div className="flex flex-col items-end gap-1.5 shrink-0">
 <span className="text-[11px] text-muted-foreground whitespace-nowrap">
 {item.time}
 </span>
 <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
 <Button
 variant="ghost"
 size="icon"
 className="size-7 rounded-lg hover:bg-accent/60"
 title="Open source"
 onClick={() => onOpenSource(item)}
 >
 <ExternalLink className="size-3.5" />
 </Button>
 <Button
 variant="ghost"
 size="icon"
 className="size-7 rounded-lg hover:bg-accent/60"
 title="Ask about this"
 onClick={() => onAskAbout(item)}
 >
 <MessageCircle className="size-3.5" />
 </Button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

function DaySection({
 day,
 onOpenSource,
 onAskAbout,
}: {
 day: DayGroup;
 onOpenSource: (item: TimelineItem) => void;
 onAskAbout: (item: TimelineItem) => void;
}) {
 return (
 <div className="relative">
 <div className="flex items-center gap-3 mb-3">
 <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
 {day.label}
 </h3>
 <span className="text-[11px] text-muted-foreground">{day.date}</span>
 <div className="flex-1 h-px bg-border" />
 </div>

 <div className="relative pl-[18px]">
 <div className="absolute left-[18px] top-0 bottom-0 w-[2px] bg-border" />
 <div className="space-y-3 relative -ml-[18px]">
 {day.items.map((item) => (
 <TimelineItemCard
 key={item.id}
 item={item}
 onOpenSource={onOpenSource}
 onAskAbout={onAskAbout}
 />
 ))}
 </div>
 </div>
 </div>
 );
}

export function TimelinePage() {
 const router = useRouter();
 const [range, setRange] = useState<TimeRange>("week");
 const [data, setData] = useState<DayGroup[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 setLoading(true);
 fetchTimelineData(range)
 .then(setData)
 .catch(() => setData([]))
 .finally(() => setLoading(false));
 }, [range]);

 const ranges: { value: TimeRange; label: string }[] = [
 { value: "today", label: "Today" },
 { value: "week", label: "This week" },
 { value: "month", label: "This month" },
 ];

 const handleOpenSource = (item: TimelineItem) => {
 router.push(`/dashboard/library/${item.id}`);
 };

 const handleAskAbout = (item: TimelineItem) => {
 router.push(`/dashboard/ask?q=${encodeURIComponent(item.summary)}`);
 };

 return (
 <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-5">
 <div className="flex items-start justify-between gap-3 flex-wrap">
 <div>
 <h1 className="text-2xl font-bold text-foreground">
 Timeline
 </h1>
 <p className="text-sm text-muted-foreground mt-1">
 Your memories, in chronological order.
 </p>
 </div>

 <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
 {ranges.map((r) => (
 <button
 key={r.value}
 onClick={() => setRange(r.value)}
 className={cn(
 "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
 range === r.value
 ? "bg-card text-foreground shadow-sm"
 : "text-muted-foreground hover:text-foreground"
 )}
 >
 {r.label}
 </button>
 ))}
 </div>
 </div>

 {loading ? (
 <div className="flex items-center gap-2 text-muted-foreground text-sm py-10">
 <Loader2 className="size-4 animate-spin" />
 Loading timeline...
 </div>
 ) : data.length > 0 ? (
 <div className="space-y-6">
 {data.map((day) => (
 <DaySection
 key={day.date}
 day={day}
 onOpenSource={handleOpenSource}
 onAskAbout={handleAskAbout}
 />
 ))}
 </div>
 ) : (
 <div className="flex flex-col items-center text-center py-16 gap-3">
 <div className="size-10 rounded-xl bg-accent flex items-center justify-center">
 <Clock className="size-5 text-muted-foreground" />
 </div>
 <p className="text-xs text-muted-foreground max-w-[28ch]">
 Your memory timeline will grow as you capture more.
 </p>
 </div>
 )}
 </div>
 );
}
