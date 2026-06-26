"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  Database,
  FileText,
  ListTodo,
  Send,
  Plus,
  Search,
  MessageSquare,
  Mail,
  Phone,
  Link2,
  Edit2,
  Trash2,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Mention {
  date: string;
  source: string;
  sourceType: string;
  excerpt: string;
}

interface PersonDetailData {
  id: string;
  name: string;
  relationship: string;
  company: string;
  role: string;
  notes: string;
  email: string;
  phone: string;
  twitter: string;
  linkedin: string;
  github: string;
  avatarUrl: string;
  summary: string;
  recentMentions: Mention[];
  promises: string[];
  openTasks: { title: string; source: string }[];
  relatedSources: { title: string; type: string; date: string }[];
}

const avatarColors = [
  "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function normalizePersonDetail(raw: any): PersonDetailData {
  return {
    id: raw.id ?? "",
    name: raw.name ?? "Unknown",
    relationship: raw.relationship ?? "",
    company: raw.company ?? "",
    role: raw.role ?? "",
    notes: raw.notes ?? "",
    email: raw.email ?? "",
    phone: raw.phone ?? "",
    twitter: raw.twitter ?? "",
    linkedin: raw.linkedin ?? "",
    github: raw.github ?? "",
    avatarUrl: raw.avatarUrl ?? raw.avatar_url ?? "",
    summary: raw.summary ?? "No summary available.",
    recentMentions: raw.recentMentions ?? raw.recent_mentions ?? [],
    promises: raw.promises ?? [],
    openTasks: raw.openTasks ?? raw.open_tasks ?? [],
    relatedSources: raw.relatedSources ?? raw.related_sources ?? [],
  };
}

export function PersonDetail({ personId }: { personId: string }) {
  const router = useRouter();
  const [person, setPerson] = useState<PersonDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const fetchPerson = useCallback(async () => {
    try {
      const data = await api.people.get(personId);
      setPerson(normalizePersonDetail(data));
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    fetchPerson();
  }, [fetchPerson]);

  useEffect(() => {
    if (person) {
      setForm({
        name: person.name,
        relationship: person.relationship,
        company: person.company,
        role: person.role,
        email: person.email,
        phone: person.phone,
        twitter: person.twitter,
        linkedin: person.linkedin,
        github: person.github,
        avatarUrl: person.avatarUrl,
        notes: person.notes,
      });
    }
  }, [person]);

  const handleUpdatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setUpdating(true);
    try {
      await api.people.update(personId, {
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
      });
      toast.success("Profile updated successfully");
      setEditOpen(false);
      fetchPerson();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePerson = async () => {
    setDeleting(true);
    try {
      await api.people.delete(personId);
      toast.success("Contact deleted successfully");
      router.push("/dashboard/people");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete contact");
      setDeleting(false);
    }
  };

  const colorIdx =
    personId.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
    avatarColors.length;

  if (loading) {
    return <PersonDetailSkeleton />;
  }

  if (error || !person) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        <Link
          href="/dashboard/people"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to People
        </Link>
        <div className="text-center py-16 border-2 border-dashed border-border rounded-3xl">
          <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Could not load person details. Make sure the API is running.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <Link
        href="/dashboard/people"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to People
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Main Details Area */}
        <div className="md:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="size-16">
                {person.avatarUrl && <AvatarImage src={person.avatarUrl} alt={person.name} className="object-cover" />}
                <AvatarFallback
                  className={cn("text-xl font-bold", avatarColors[colorIdx])}
                >
                  {getInitials(person.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 pt-1">
                <h1 className="text-2xl font-bold text-foreground font-[var(--font-nunito)]">{person.name}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  {person.relationship && (
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {person.relationship}
                    </Badge>
                  )}
                  {person.role && (
                    <span className="text-xs text-muted-foreground font-medium">
                      {person.role}
                      {person.company && ` at ${person.company}`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-9 cursor-pointer">
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update information for {person.name}.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdatePerson} className="space-y-4 py-2">
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
                        placeholder="Notes about this person..."
                        className="resize-none h-16"
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      />
                    </div>
                    <DialogFooter className="pt-2">
                      <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updating}>
                        {updating ? "Saving..." : "Save Changes"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl h-9 text-destructive hover:bg-destructive/10 hover:text-destructive border-border cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Delete Contact</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete {person.name}? This will remove their contact profile, but will not delete related memories.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeletePerson} disabled={deleting}>
                      {deleting ? "Deleting..." : "Delete Profile"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* AI Summary */}
          <Card className="rounded-2xl border-2 border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2.5">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary font-[var(--font-nunito)]">
                  AI Summary
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {person.summary}
              </p>
              {person.notes && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Custom Notes</h4>
                    <p className="text-xs text-muted-foreground/90 whitespace-pre-line">{person.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Promises Made */}
          {person.promises.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-bold flex items-center gap-2 font-[var(--font-nunito)] text-foreground">
                <CheckSquare className="w-4 h-4 text-amber-500" />
                Promises Made
              </h2>
              <div className="space-y-2">
                {person.promises.map((promise, i) => (
                  <Card
                    key={i}
                    className="rounded-2xl border-2 border-amber-500/10 bg-amber-500/[0.01]"
                  >
                    <CardContent className="p-4">
                      <p className="text-sm font-semibold text-foreground/90 leading-relaxed">{promise}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Open Tasks */}
          {person.openTasks.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-bold flex items-center gap-2 font-[var(--font-nunito)] text-foreground">
                <ListTodo className="w-4 h-4 text-primary" />
                Open Tasks
              </h2>
              <div className="space-y-2">
                {person.openTasks.map((task, i) => (
                  <Card key={i} className="rounded-2xl border-2 border-border shadow-sm">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/60 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{task.title}</p>
                        <p className="text-[10px] text-muted-foreground/80 mt-0.5 truncate flex items-center gap-1">
                          <FileText className="w-3 h-3 shrink-0" />
                          {task.source}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Recent Mentions */}
          {person.recentMentions.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-bold flex items-center gap-2 font-[var(--font-nunito)] text-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                Recent Mentions
              </h2>
              <div className="space-y-2.5">
                {person.recentMentions.map((mention, i) => (
                  <Card key={i} className="rounded-2xl border-2 border-border shadow-sm">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground font-semibold">
                        <span className="flex items-center gap-1 truncate">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground/70" />
                          {mention.source}
                        </span>
                        <span className="shrink-0 text-muted-foreground/60">
                          {new Date(mention.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground italic pl-3 border-l-2 border-primary/20 leading-relaxed">
                        "{mention.excerpt}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Info Area */}
        <div className="md:col-span-4 space-y-6 sticky top-8">
          {/* Contact Details Card */}
          <Card className="rounded-2xl border-2 border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 mb-2">
                Contact & Socials
              </h3>
              
              <div className="space-y-3.5">
                <ContactRow icon={<Mail className="w-4 h-4" />} label="Email" value={person.email} isEmail />
                <ContactRow icon={<Phone className="w-4 h-4" />} label="Phone" value={person.phone} />
                <ContactRow icon={<Link2 className="w-4 h-4" />} label="Twitter" value={person.twitter} isSocial handlePrefix="@" urlPattern="https://twitter.com/{val}" />
                <ContactRow icon={<Link2 className="w-4 h-4" />} label="LinkedIn" value={person.linkedin} isSocial urlPattern="https://linkedin.com/in/{val}" />
                <ContactRow icon={<Link2 className="w-4 h-4" />} label="GitHub" value={person.github} isSocial urlPattern="https://github.com/{val}" />
              </div>

              {!person.email && !person.phone && !person.twitter && !person.linkedin && !person.github && (
                <p className="text-xs text-muted-foreground text-center py-2 italic">
                  No contact info added.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Email Composer (Debo Mail only) */}
          {person.email && person.email.toLowerCase().endsWith("@debo.life") && (
            <Card className="rounded-2xl border-2 border-primary/10 bg-primary/[0.01]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-primary font-[var(--font-nunito)]">Send Debo Mail</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] border-primary/20 text-primary bg-primary/5">
                    Internal Mail
                  </Badge>
                </div>
                
                <EmailComposer recipientEmail={person.email} />
              </CardContent>
            </Card>
          )}

          {/* Related Sources */}
          {person.relatedSources.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 px-1">
                Related Sources
              </h3>
              <div className="space-y-1 bg-card border-2 border-border rounded-2xl p-2.5 shadow-sm max-h-60 overflow-y-auto scrollbar-none">
                {person.relatedSources.map((source, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-accent transition-colors cursor-pointer group"
                  >
                    <FileText className="w-3.5 h-3.5 text-muted-foreground/75 group-hover:text-primary transition-colors shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground/90 truncate group-hover:text-primary transition-colors">{source.title}</p>
                      <p className="text-[9px] text-muted-foreground/60 font-semibold uppercase mt-0.5">{source.type}</p>
                    </div>
                    <span className="text-[9px] text-muted-foreground/60 font-semibold shrink-0">
                      {source.date}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Suggested Follow-ups */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 px-1">Suggested Follow-ups</h3>
            <div className="flex flex-col gap-2">
              <Button size="sm" className="rounded-xl gap-1.5 h-9 justify-start font-bold text-xs" asChild>
                <Link href={`/dashboard/chat?question=Draft a follow up message to ${person.name}`}>
                  <Send className="w-3.5 h-3.5" />
                  Draft message
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-9 justify-start font-bold text-xs border-border" asChild>
                <Link href={`/dashboard/tasks?createForPersonId=${person.id}`}>
                  <Plus className="w-3.5 h-3.5" />
                  Create task
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-9 justify-start font-bold text-xs border-border" asChild>
                <Link href={`/dashboard/chat?question=What did I promise to ${person.name} recently?`}>
                  <Search className="w-3.5 h-3.5" />
                  Ask about {person.name}
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  isEmail,
  isSocial,
  handlePrefix = "",
  urlPattern = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isEmail?: boolean;
  isSocial?: boolean;
  handlePrefix?: string;
  urlPattern?: string;
}) {
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanVal = value.trim();
  const url = isEmail
    ? `mailto:${cleanVal}`
    : isSocial && urlPattern
    ? urlPattern.replace("{val}", cleanVal)
    : undefined;

  return (
    <div className="flex items-center justify-between group gap-2 text-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider leading-none mb-0.5">
            {label}
          </p>
          {url ? (
            <a
              href={url}
              target={isSocial ? "_blank" : undefined}
              rel={isSocial ? "noopener noreferrer" : undefined}
              className="text-foreground/90 font-semibold hover:text-primary transition-colors truncate block max-w-[160px]"
            >
              {handlePrefix}
              {cleanVal}
            </a>
          ) : (
            <span className="text-foreground/90 font-semibold truncate block max-w-[160px]">
              {cleanVal}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-1 text-muted-foreground/60 hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer"
          title="Copy"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
        {url && isSocial && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-muted-foreground/60 hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer"
            title="Open Link"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function EmailComposer({ recipientEmail }: { recipientEmail: string }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.toLowerCase().endsWith("@debo.life")) {
      toast.error("Debo Mail only supports internal @debo.life addresses.");
      return;
    }
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and body are required");
      return;
    }
    setSending(true);
    try {
      await api.mail.send({
        to: recipientEmail.trim(),
        subject: subject.trim(),
        body: body.trim(),
      });
      toast.success("Email sent successfully via Debo Mail!");
      setSubject("");
      setBody("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="space-y-3 pt-1">
      <div className="space-y-1">
        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Subject</label>
        <Input
          placeholder="Subject of the email"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-8 text-xs rounded-lg"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Message</label>
        <Textarea
          placeholder="Write your email message..."
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="resize-none h-20 text-xs rounded-lg p-2"
        />
      </div>
      <Button type="submit" size="sm" className="w-full text-xs font-bold rounded-xl cursor-pointer" disabled={sending}>
        {sending ? "Sending..." : "Send Email"}
      </Button>
    </form>
  );
}

export function PersonDetailSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to People
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-pulse">
        <div className="md:col-span-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="size-16 rounded-full bg-muted shrink-0" />
            <div className="space-y-2 flex-1 pt-1">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
          </div>
          <div className="h-28 bg-card border-2 border-border rounded-2xl" />
          <div className="h-48 bg-card border-2 border-border rounded-2xl" />
        </div>
        <div className="md:col-span-4 space-y-6">
          <div className="h-40 bg-card border-2 border-border rounded-2xl" />
          <div className="h-48 bg-card border-2 border-border rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
