"use client";

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

const mockPerson: PersonDetailData = {
  id: "person-001",
  name: "Raj",
  context: "Marketing / Q4 Budget",
  summary:
    "Raj is related to your marketing work and Q4 budget planning. You recently promised to send him the finalized allocation by Friday before the board meeting.",
  recentMentions: [
    {
      date: "Tuesday",
      source: "Marketing Sync voice note",
      sourceType: "voice",
      excerpt:
        '"...promised Raj I\'ll send the finalized Q4 budget allocation by Friday..."',
    },
    {
      date: "Last week",
      source: "Q4 Planning meeting",
      sourceType: "meeting",
      excerpt:
        '"...Raj raised concerns about the marketing spend allocation for Q4..."',
    },
    {
      date: "2 weeks ago",
      source: "Weekly Review journal",
      sourceType: "journal",
      excerpt:
        '"...need to align with Raj on the revised budget numbers before presenting to the board..."',
    },
    {
      date: "3 weeks ago",
      source: "Budget Draft email",
      sourceType: "email",
      excerpt:
        '"...Raj sent over the initial figures, looks like we need to adjust the allocation..."',
    },
  ],
  promises: [
    "Send finalized Q4 budget allocation by Friday (source: Marketing Sync voice note)",
    "Schedule a review call before the board meeting (source: Q4 Planning meeting)",
  ],
  openTasks: [
    { title: "Send finalized Q4 budget to Raj", source: "Marketing Sync" },
    { title: "Schedule budget review call", source: "Q4 Planning" },
  ],
  relatedSources: [
    { title: "Marketing Sync voice note", type: "voice", date: "Tuesday" },
    { title: "Q4 Planning meeting", type: "meeting", date: "Last week" },
    { title: "Q4 Allocation Draft.pdf", type: "file", date: "2 weeks ago" },
    { title: "Weekly Review journal", type: "journal", date: "2 weeks ago" },
  ],
};

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

export function PersonDetail({ personId }: { personId: string }) {
  const person = mockPerson;
  const colorIdx =
    personId.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
    avatarColors.length;

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

      {/* Promises Made */}
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

      {/* Open Tasks */}
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

      {/* Related Sources */}
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
