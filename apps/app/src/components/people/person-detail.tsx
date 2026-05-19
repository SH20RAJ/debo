"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/api";

interface Mention {
  date: string;
  source: string;
  sourceType: string;
  excerpt: string;
}

interface PersonDetailData {
  id: string;
  name: string;
  context: string;
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
    context: raw.context ?? "",
    summary: raw.summary ?? "No summary available.",
    recentMentions: raw.recentMentions ?? raw.recent_mentions ?? [],
    promises: raw.promises ?? [],
    openTasks: raw.openTasks ?? raw.open_tasks ?? [],
    relatedSources: raw.relatedSources ?? raw.related_sources ?? [],
  };
}

export function PersonDetail({ personId }: { personId: string }) {
  const [person, setPerson] = useState<PersonDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchPerson() {
      try {
        const data = await api.people.get(personId);
        if (!cancelled) {
          setPerson(normalizePersonDetail(data));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }
    fetchPerson();
    return () => { cancelled = true; };
  }, [personId]);

  const colorIdx =
    personId.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
    avatarColors.length;

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        <Link
          href="/dashboard/people"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to People
        </Link>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              <div className="h-5 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="h-24 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
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
        <div className="text-center py-16">
          <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Could not load person details. Make sure the API is running.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard/people"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to People
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <Avatar size="lg" className="size-14">
          <AvatarFallback
            className={cn("text-lg font-bold", avatarColors[colorIdx])}
          >
            {getInitials(person.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{person.name}</h1>
          <Badge variant="secondary" className="mt-1">
            {person.context}
          </Badge>
        </div>
      </div>

      {/* AI Summary */}
      <Card className="rounded-xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary">
              AI Summary
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {person.summary}
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Recent Mentions */}
      {person.recentMentions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Recent Mentions
          </h2>
          <div className="space-y-2">
            {person.recentMentions.map((mention, i) => (
              <Card key={i} className="rounded-xl">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="w-3 h-3" />
                    <span className="font-medium">{mention.source}</span>
                    <span className="text-muted-foreground/60">
                      {mention.date}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground italic pl-5 border-l-2 border-border">
                    {mention.excerpt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Promises Made */}
      {person.promises.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary" />
            Promises Made
          </h2>
          <div className="space-y-2">
            {person.promises.map((promise, i) => (
              <Card
                key={i}
                className="rounded-xl border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20"
              >
                <CardContent className="p-4">
                  <p className="text-sm font-medium">{promise}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Open Tasks */}
      {person.openTasks.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-primary" />
            Open Tasks
          </h2>
          <div className="space-y-2">
            {person.openTasks.map((task, i) => (
              <Card key={i} className="rounded-xl">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.source}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Related Sources */}
      {person.relatedSources.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Related Sources
          </h2>
          <div className="space-y-1">
            {person.relatedSources.map((source, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg px-4 py-2.5 hover:bg-accent transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{source.title}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {source.date}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <Separator />

      {/* Suggested Follow-ups */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold">Suggested Follow-ups</h2>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="rounded-lg gap-1.5">
            <Send className="w-3 h-3" />
            Draft message
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5">
            <Plus className="w-3 h-3" />
            Create task
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5">
            <Search className="w-3 h-3" />
            Ask about {person.name}
          </Button>
        </div>
      </section>
    </div>
  );
}
