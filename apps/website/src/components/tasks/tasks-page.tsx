"use client";

import { useEffect, useState, useCallback } from "react";
import { ListTodo, Sparkles, Plus, Inbox, CheckCircle2, Circle, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCard } from "./task-card";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DeboTask } from "@/lib/types";

function normalizeTask(raw: any): DeboTask {
 return {
 id: raw.id ?? crypto.randomUUID(),
 title: raw.title ?? "Untitled task",
 status: raw.status ?? "todo",
 dueDate: raw.dueAt ?? raw.dueDate ?? raw.due_date,
 relatedPerson: raw.relatedPerson ?? raw.related_person,
 sourceId: raw.sourceId ?? raw.source_id,
 confidence: raw.confidence ?? "partial",
 extractionStatus: raw.extractionStatus ?? raw.extraction_status ?? "manual",
 };
}

export function TasksPage() {
 const [activeTasks, setActiveTasks] = useState<DeboTask[]>([]);
 const [pendingTasks, setPendingTasks] = useState<DeboTask[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(false);

 const fetchData = useCallback(async () => {
 try {
 const [activeRes, pendingRes] = await Promise.all([
 api.tasks.list({ extractionStatus: "manual" }),
 api.tasks.list({ extractionStatus: "extracted_pending" }),
 ]);
 
 const activeItems = Array.isArray(activeRes) ? activeRes : activeRes?.data ?? [];
 const pendingItems = Array.isArray(pendingRes) ? pendingRes : pendingRes?.data ?? [];

 setActiveTasks(activeItems.map(normalizeTask));
 setPendingTasks(pendingItems.map(normalizeTask));
 setLoading(false);
 } catch (err) {
 console.error("Failed to fetch tasks", err);
 setError(true);
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 fetchData();
 }, [fetchData]);

 const todoTasks = activeTasks.filter(t => t.status === "todo" || t.status === "inbox");
 const doingTasks = activeTasks.filter(t => t.status === "doing");
 const doneTasks = activeTasks.filter(t => t.status === "done");

 const header = (
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
 <p className="text-xs text-muted-foreground mt-1">Manage your manual commitments and AI-extracted suggestions.</p>
 </div>
 <Button className="rounded-xl bg-primary text-primary-foreground font-bold text-xs h-9 px-4 shadow-[0_2px_0_#46A302] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none transition-all">
 <Plus className="size-3.5 mr-1.5 stroke-[3px]" />
 New Task
 </Button>
 </div>
 );

 if (loading) {
 return <TasksSkeleton />;
 }

 return (
 <div className="p-6 md:p-8 max-w-7xl mx-auto">
 {header}

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 {/* Main Task View */}
 <div className="lg:col-span-8 space-y-6">
 <Tabs defaultValue="all" className="w-full">
 <TabsList className="bg-muted/50 p-1 rounded-xl mb-4">
 <TabsTrigger value="all" className="rounded-lg text-xs font-bold px-4">All Tasks</TabsTrigger>
 <TabsTrigger value="todo" className="rounded-lg text-xs font-bold px-4">Todo</TabsTrigger>
 <TabsTrigger value="doing" className="rounded-lg text-xs font-bold px-4">Doing</TabsTrigger>
 <TabsTrigger value="done" className="rounded-lg text-xs font-bold px-4">Completed</TabsTrigger>
 </TabsList>

 <TabsContent value="all" className="mt-0 space-y-8">
 <section>
 <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3 px-1 flex items-center gap-2">
 <Circle className="size-2.5 text-amber-500 fill-amber-500" />
 Todo ({todoTasks.length})
 </h3>
 <div className="space-y-2">
 {todoTasks.map(t => <TaskCard key={t.id} task={t} onUpdate={fetchData} />)}
 {todoTasks.length === 0 && <EmptyState message="No tasks to do." />}
 </div>
 </section>

 {doingTasks.length > 0 && (
 <section>
 <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3 px-1 flex items-center gap-2">
 <Clock className="size-2.5 text-blue-500 fill-blue-500" />
 In Progress ({doingTasks.length})
 </h3>
 <div className="space-y-2">
 {doingTasks.map(t => <TaskCard key={t.id} task={t} onUpdate={fetchData} />)}
 </div>
 </section>
 )}

 <section>
 <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3 px-1 flex items-center gap-2">
 <CheckCircle2 className="size-2.5 text-emerald-500 fill-emerald-500" />
 Completed ({doneTasks.length})
 </h3>
 <div className="space-y-2">
 {doneTasks.map(t => <TaskCard key={t.id} task={t} onUpdate={fetchData} />)}
 {doneTasks.length === 0 && <EmptyState message="No completed tasks." />}
 </div>
 </section>
 </TabsContent>

 <TabsContent value="todo">
 <div className="space-y-2">
 {todoTasks.map(t => <TaskCard key={t.id} task={t} onUpdate={fetchData} />)}
 </div>
 </TabsContent>
 
 <TabsContent value="doing">
 <div className="space-y-2">
 {doingTasks.map(t => <TaskCard key={t.id} task={t} onUpdate={fetchData} />)}
 </div>
 </TabsContent>

 <TabsContent value="done">
 <div className="space-y-2">
 {doneTasks.map(t => <TaskCard key={t.id} task={t} onUpdate={fetchData} />)}
 </div>
 </TabsContent>
 </Tabs>
 </div>

 {/* AI Inbox Sidebar */}
 <div className="lg:col-span-4 sticky top-8">
 <div className="rounded-3xl border-2 border-emerald-500/10 bg-emerald-500/[0.02] overflow-hidden flex flex-col max-h-[calc(100vh-160px)]">
 <div className="p-4 border-b border-emerald-500/10 bg-emerald-500/5 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Sparkles className="size-4 text-emerald-500" />
 <h2 className="text-sm font-bold text-foreground">AI Suggestions</h2>
 </div>
 <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-bold">
 {pendingTasks.length} New
 </Badge>
 </div>
 
 <ScrollArea className="flex-1">
 <div className="p-4 space-y-3">
 {pendingTasks.length > 0 ? (
 pendingTasks.map(t => <TaskCard key={t.id} task={t} onUpdate={fetchData} />)
 ) : (
 <div className="py-12 text-center space-y-2">
 <Inbox className="size-8 text-muted-foreground/30 mx-auto" />
 <p className="text-[11px] text-muted-foreground font-medium px-4">
 Debo is monitoring your journals and voice notes for new tasks.
 </p>
 </div>
 )}
 </div>
 </ScrollArea>
 </div>
 </div>
 </div>
 </div>
 );
}

function EmptyState({ message }: { message: string }) {
 return (
 <div className="py-8 text-center border-2 border-dashed border-border rounded-2xl">
 <p className="text-xs text-muted-foreground font-medium">{message}</p>
 </div>
 );
}

export function TasksSkeleton() {
 return (
 <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-5 animate-pulse">
 {/* Header */}
 <div className="flex items-center justify-between mb-8">
 <div className="space-y-2">
 <div className="h-7 w-28 bg-muted rounded-xl" />
 <div className="h-4 w-72 bg-muted rounded-lg" />
 </div>
 <div className="h-9 w-24 bg-muted rounded-xl" />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 {/* Main List */}
 <div className="lg:col-span-8 space-y-6">
 <div className="flex gap-2 mb-4">
 <div className="h-8 w-20 bg-muted rounded-lg" />
 <div className="h-8 w-16 bg-muted rounded-lg" />
 <div className="h-8 w-16 bg-muted rounded-lg" />
 <div className="h-8 w-24 bg-muted rounded-lg" />
 </div>
 
 <div className="space-y-6">
 <div className="space-y-2">
 <div className="h-3.5 w-20 bg-muted rounded-md" />
 {[1, 2].map((i) => (
 <div key={i} className="h-16 bg-card border-2 border-border rounded-2xl flex items-center gap-3 p-4">
 <div className="w-4 h-4 rounded-full bg-muted" />
 <div className="flex-1 space-y-2">
 <div className="h-4 bg-muted rounded w-1/3" />
 <div className="h-3 bg-muted rounded w-1/4" />
 </div>
 </div>
 ))}
 </div>
 <div className="space-y-2">
 <div className="h-3.5 w-24 bg-muted rounded-md" />
 <div className="h-16 bg-card border-2 border-border rounded-2xl flex items-center gap-3 p-4">
 <div className="w-4 h-4 rounded-full bg-muted" />
 <div className="flex-1 space-y-2">
 <div className="h-4 bg-muted rounded w-1/2" />
 <div className="h-3 bg-muted rounded w-1/3" />
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Sidebar */}
 <div className="lg:col-span-4">
 <div className="rounded-3xl border-2 border-border bg-card overflow-hidden">
 <div className="p-4 border-b border-border flex items-center justify-between">
 <div className="h-4 w-28 bg-muted rounded-md" />
 <div className="h-4 w-12 bg-muted rounded-md" />
 </div>
 <div className="p-4 space-y-3 h-[320px]">
 {[1, 2].map((i) => (
 <div key={i} className="h-16 bg-muted/40 rounded-2xl flex items-center gap-3 p-4">
 <div className="w-4 h-4 rounded-full bg-muted" />
 <div className="flex-1 space-y-2">
 <div className="h-3.5 bg-muted rounded w-2/3" />
 <div className="h-3 bg-muted rounded w-1/2" />
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
