"use client";

import { useEffect, useState } from "react";
import { Search, Users, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/components/ui/dialog";
import { PersonCard } from "./person-card";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { PersonMemory } from "@/lib/types";

function normalizePerson(raw: any): PersonMemory {
 return {
 id: raw.id ?? crypto.randomUUID(),
 name: raw.name ?? "Unknown",
 context: raw.relationship ?? raw.role ?? raw.company ?? raw.context ?? "",
 lastMentioned: raw.lastMentioned ?? raw.lastMentionedAt ?? raw.last_mentioned_at ?? raw.last_mentioned ?? new Date().toISOString(),
 openTaskCount: raw.openTaskCount ?? raw.open_task_count ?? 0,
 memoryCount: raw.memoryCount ?? raw.memory_count ?? raw.mentionCount ?? raw.mention_count ?? 0,
 avatar: raw.avatarUrl ?? raw.avatar_url ?? raw.avatar,
 email: raw.email ?? "",
 phone: raw.phone ?? "",
 twitter: raw.twitter ?? "",
 linkedin: raw.linkedin ?? "",
 github: raw.github ?? "",
 relationship: raw.relationship ?? "",
 company: raw.company ?? "",
 role: raw.role ?? "",
 notes: raw.notes ?? "",
 };
}

export function PeoplePage() {
 const [query, setQuery] = useState("");
 const [people, setPeople] = useState<PersonMemory[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(false);
 const [createOpen, setCreateOpen] = useState(false);
 const [submitting, setSubmitting] = useState(false);

 const [form, setForm] = useState({
 name: "",
 relationship: "",
 company: "",
 role: "",
 email: "",
 phone: "",
 twitter: "",
 linkedin: "",
 github: "",
 avatarUrl: "",
 notes: "",
 });

 async function fetchPeople() {
 try {
 setLoading(true);
 const data = await api.people.list();
 const items = Array.isArray(data) ? data : data?.people ?? data?.data ?? [];
 setPeople(items.map(normalizePerson));
 setError(false);
 } catch {
 setError(true);
 } finally {
 setLoading(false);
 }
 }

 useEffect(() => {
 fetchPeople();
 }, []);

 const handleCreatePerson = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!form.name.trim()) {
 toast.error("Name is required");
 return;
 }
 setSubmitting(true);
 try {
 await api.people.create({
 name: form.name.trim(),
 relationship: form.relationship.trim() || undefined,
 company: form.company.trim() || undefined,
 role: form.role.trim() || undefined,
 notes: form.notes.trim() || undefined,
 email: form.email.trim() || undefined,
 phone: form.phone.trim() || undefined,
 twitter: form.twitter.trim() || undefined,
 linkedin: form.linkedin.trim() || undefined,
 github: form.github.trim() || undefined,
 avatarUrl: form.avatarUrl.trim() || undefined,
 } as any);

 toast.success("Person created successfully");
 setCreateOpen(false);
 setForm({
 name: "",
 relationship: "",
 company: "",
 role: "",
 email: "",
 phone: "",
 twitter: "",
 linkedin: "",
 github: "",
 avatarUrl: "",
 notes: "",
 });
 fetchPeople();
 } catch (err: any) {
 toast.error(err.message || "Failed to create person");
 } finally {
 setSubmitting(false);
 }
 };

 const filtered = query
 ? people.filter(
 (p) =>
 p.name.toLowerCase().includes(query.toLowerCase()) ||
 p.context.toLowerCase().includes(query.toLowerCase()) ||
 (p.company && p.company.toLowerCase().includes(query.toLowerCase())) ||
 (p.role && p.role.toLowerCase().includes(query.toLowerCase()))
 )
 : people;

 const header = (
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold text-foreground">
 People
 </h1>
 <p className="text-sm text-muted-foreground mt-1">
 Everyone Debo has noticed in your memories.
 </p>
 </div>
 <Dialog open={createOpen} onOpenChange={setCreateOpen}>
 <DialogTrigger asChild>
 <Button className="rounded-xl bg-primary text-primary-foreground font-bold text-xs h-9 px-4 shadow-[0_2px_0_#46A302] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer">
 <Plus className="size-3.5 mr-1.5 stroke-[3px]" />
 New Person
 </Button>
 </DialogTrigger>
 <DialogContent className="sm:max-w-[480px]">
 <DialogHeader>
 <DialogTitle>Add Person</DialogTitle>
 <DialogDescription>
 Create a new contact profile manually. Debo will link mentions to this profile.
 </DialogDescription>
 </DialogHeader>
 <form onSubmit={handleCreatePerson} className="space-y-4 py-2">
 <div className="space-y-1">
 <label className="text-xs font-bold text-muted-foreground">Name *</label>
 <Input
 placeholder="Full Name"
 required
 value={form.name}
 onChange={(e) => setForm({ ...form, name: e.target.value })}
 />
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="text-xs font-bold text-muted-foreground">Relationship</label>
 <Input
 placeholder="e.g. Friend, Colleague"
 value={form.relationship}
 onChange={(e) => setForm({ ...form, relationship: e.target.value })}
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-muted-foreground">Company</label>
 <Input
 placeholder="Company Name"
 value={form.company}
 onChange={(e) => setForm({ ...form, company: e.target.value })}
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="text-xs font-bold text-muted-foreground">Role</label>
 <Input
 placeholder="e.g. Developer, Designer"
 value={form.role}
 onChange={(e) => setForm({ ...form, role: e.target.value })}
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-muted-foreground">Debo Mail / Email</label>
 <Input
 placeholder="email@debo.life"
 type="email"
 value={form.email}
 onChange={(e) => setForm({ ...form, email: e.target.value })}
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="text-xs font-bold text-muted-foreground">Phone</label>
 <Input
 placeholder="+1234567890"
 value={form.phone}
 onChange={(e) => setForm({ ...form, phone: e.target.value })}
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-muted-foreground">Photo / Avatar URL</label>
 <Input
 placeholder="https://..."
 value={form.avatarUrl}
 onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
 />
 </div>
 </div>
 <div className="grid grid-cols-3 gap-2">
 <div className="space-y-1">
 <label className="text-xs font-bold text-muted-foreground">Twitter</label>
 <Input
 placeholder="Username"
 value={form.twitter}
 onChange={(e) => setForm({ ...form, twitter: e.target.value })}
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-muted-foreground">LinkedIn</label>
 <Input
 placeholder="Username"
 value={form.linkedin}
 onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-muted-foreground">GitHub</label>
 <Input
 placeholder="Username"
 value={form.github}
 onChange={(e) => setForm({ ...form, github: e.target.value })}
 />
 </div>
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-muted-foreground">Notes</label>
 <Textarea
 placeholder="Additional notes about this person..."
 className="resize-none h-16"
 value={form.notes}
 onChange={(e) => setForm({ ...form, notes: e.target.value })}
 />
 </div>
 <DialogFooter className="pt-2">
 <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
 Cancel
 </Button>
 <Button type="submit" disabled={submitting}>
 {submitting ? "Saving..." : "Create"}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 </div>
 );

 if (loading) {
 return <PeopleSkeleton />;
 }

 return (
 <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-5">
 {header}

 <div className="relative max-w-sm">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
 <Input
 placeholder="Search people..."
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 className="pl-9"
 />
 </div>

 {error ? (
 <div className="flex flex-col items-center text-center py-16 gap-3">
 <div className="size-10 rounded-xl bg-accent flex items-center justify-center">
 <Users className="size-5 text-muted-foreground" />
 </div>
 <p className="text-xs text-muted-foreground max-w-[28ch]">
 Could not load people. Make sure the API is running.
 </p>
 </div>
 ) : filtered.length === 0 ? (
 <div className="flex flex-col items-center text-center py-16 gap-3">
 <div className="size-10 rounded-xl bg-accent flex items-center justify-center">
 <Users className="size-5 text-muted-foreground" />
 </div>
 <p className="text-xs text-muted-foreground max-w-[28ch]">
 {query
 ? "No people match your search."
 : "People will appear here as they are mentioned in your memories."}
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
 {filtered.map((person) => (
 <PersonCard key={person.id} person={person} />
 ))}
 </div>
 )}
 </div>
 );
}

export function PeopleSkeleton() {
 return (
 <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-5 animate-pulse">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div className="space-y-2">
 <div className="h-7 w-28 bg-muted rounded-xl" />
 <div className="h-4 w-72 bg-muted rounded-lg" />
 </div>
 <div className="h-9 w-24 bg-muted rounded-xl" />
 </div>

 {/* Search Input Outline */}
 <div className="h-9 max-w-sm bg-muted rounded-xl" />

 {/* Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
 {[1, 2, 3, 4, 5, 6].map((i) => (
 <div
 key={i}
 className="rounded-2xl border-2 border-border bg-card p-4 h-full flex flex-col gap-3"
 >
 <div className="flex items-start gap-3">
 <div className="size-10 rounded-full bg-muted shrink-0" />
 <div className="flex-1 space-y-2">
 <div className="h-4 bg-muted rounded w-2/3" />
 <div className="h-3 bg-muted rounded w-1/2" />
 </div>
 </div>
 <div className="flex items-center gap-3 pt-1">
 <div className="h-3.5 bg-muted rounded w-1/4" />
 <div className="h-3.5 bg-muted rounded w-1/4" />
 <div className="h-3.5 bg-muted rounded w-1/4" />
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}
