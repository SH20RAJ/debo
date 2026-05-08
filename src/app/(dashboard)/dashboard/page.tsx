import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  CalendarClock,
  ChartNoAxesCombined,
  Cpu,
  Database,
  FileImage,
  Library,
  MessageSquareText,
  Mic2,
  PenLine,
  Search,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react";
import { redirect } from "next/navigation";

import { resolveUserId } from "@/actions/auth-sync";
import { getJournalsCount } from "@/actions/journals";
import { Button } from "@/components/ui/button";
import { queryGraph, refreshMemoryGraph } from "@/lib/life/graph";
import { getLifeTimeline } from "@/lib/life/timeline";
import { stackServerApp } from "@/stack/server";

export const metadata: Metadata = {
  title: "Debo Studio",
  description:
    "A clean Debo workspace for chat, capture, journaling, memory, and assistant context.",
};

export default async function DashboardPage() {
  const userId = await resolveUserId();
  if (!userId) redirect("/join");

  const user = await stackServerApp.getUser();
  if (!user) redirect("/join");

  const [journalCount, timeline] = await Promise.all([
    getJournalsCount(),
    getLifeTimeline(userId, "daily"),
  ]);

  let graph = await queryGraph(
    "What recurring patterns stand out in my life?",
    userId,
  );

  if (!graph.topPeople.length && journalCount > 0) {
    await refreshMemoryGraph(userId);
    graph = await queryGraph(
      "What recurring patterns stand out in my life?",
      userId,
    );
  }

  const recentTimeline = timeline.slice(-4).reverse();
  const firstName = (user.displayName ?? "there").split(" ")[0];
  const signalCount =
    graph.topPeople.length + graph.topTopics.length + graph.topEmotions.length;

  const primaryActions = [
    {
      title: "Talk with Debo",
      description: "Open the homie chat with thread history and memory context.",
      href: "/chat",
      icon: MessageSquareText,
    },
    {
      title: "Capture a moment",
      description: "Record audio, save a video journal, or upload diary pages.",
      href: "/dashboard/capture",
      icon: Mic2,
    },
    {
      title: "Write journal",
      description: "Start a focused text entry and let Debo process it.",
      href: "/dashboard/journal/new",
      icon: PenLine,
    },
    {
      title: "Review memory",
      description: "Scan patterns, timeline, and stored life signals.",
      href: "/dashboard/insights",
      icon: ChartNoAxesCombined,
    },
  ];

  const captureModes = [
    {
      title: "Audio journal",
      description: "Speak quickly when writing feels slow.",
      icon: Mic2,
    },
    {
      title: "Video journal",
      description: "Keep context from vlogs and daily check-ins.",
      icon: Video,
    },
    {
      title: "Diary pages",
      description: "Upload handwritten pages for later OCR and context.",
      icon: FileImage,
    },
  ];

  const metrics = [
    { label: "Journals", value: journalCount.toString(), description: "Saved moments" },
    { label: "Recent", value: recentTimeline.length.toString(), description: "Timeline groups" },
    { label: "Patterns", value: graph.patterns.length.toString(), description: "Memory themes" },
    { label: "Signals", value: signalCount.toString(), description: "People, topics, emotions" },
  ];

  const quickLinks = [
    { title: "Archive", href: "/dashboard/journals", icon: Library },
    { title: "Timeline", href: "/dashboard/timeline", icon: CalendarClock },
    { title: "Memories", href: "/dashboard/memories", icon: Database },
    { title: "MCP", href: "/dashboard/mcp", icon: Cpu },
  ];

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 lg:px-8">
        <header className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Studio synced
            </div>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                Welcome back, {firstName}.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Debo Studio is the clean workspace for talking, capturing, journaling, and turning your life context into useful memory.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="h-10 rounded-md gap-2">
              <Link href="/chat">
                <MessageSquareText className="h-4 w-4" />
                Open Chat
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-10 rounded-md gap-2">
              <Link href="/dashboard/capture">
                <Mic2 className="h-4 w-4" />
                Capture
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {primaryActions.map((action) => (
            <ActionCard key={action.href} {...action} />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <SectionHeader
              eyebrow="Capture"
              title="Fast journaling lanes"
              description="Audio, video, and page uploads now have a visible place before they become transcripts, OCR, and assistant context."
            />
            <div className="grid gap-3 md:grid-cols-3">
              {captureModes.map((mode) => (
                <Link
                  key={mode.title}
                  href="/dashboard/capture"
                  className="group rounded-lg border border-border bg-background p-4 transition hover:border-foreground"
                >
                  <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground">
                    <mode.icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">{mode.title}</h3>
                    <p className="text-sm leading-5 text-muted-foreground">{mode.description}</p>
                  </div>
                  <ArrowRight className="mt-5 h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Search className="h-4 w-4" />
              Memory status
            </div>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-md border border-border bg-background p-3">
                  <div className="text-2xl font-semibold tracking-tight text-foreground">{metric.value}</div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {metric.label}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{metric.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <SectionHeader
              eyebrow="Recent"
              title="Latest timeline"
              description="A quick scan of the moments Debo can already reason over."
            />
            <div className="overflow-hidden rounded-lg border border-border">
              {recentTimeline.length > 0 ? (
                recentTimeline.map((entry, index) => (
                  <Link
                    key={`${entry.grouping}-${entry.date}`}
                    href={entry.journalIds[0] ? `/dashboard/journal/${entry.journalIds[0]}` : "/dashboard/timeline"}
                    className="grid gap-3 border-b border-border bg-background p-4 transition last:border-b-0 hover:bg-muted/40 sm:grid-cols-[120px_1fr_auto] sm:items-center"
                  >
                    <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      {format(new Date(`${entry.date}T00:00:00.000Z`), "MMM d")}
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground">{entry.summary}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.events.slice(0, 2).join(" / ") || entry.label}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {index === 0 ? <Sparkles className="h-3.5 w-3.5" /> : null}
                      {entry.journalIds.length} note{entry.journalIds.length === 1 ? "" : "s"}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-background p-8 text-center">
                  <CalendarClock className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
                  <div className="text-sm font-semibold text-foreground">No timeline yet</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Capture or write your first journal to start building memory.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="space-y-4">
              <SectionHeader
                eyebrow="Insights"
                title="Current read"
                description="The first signals from the memory graph."
              />
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="space-y-3">
                  {(graph.insights.length > 0
                    ? graph.insights.slice(0, 3)
                    : ["Add a few journals and Debo will surface patterns here."]
                  ).map((insight) => (
                    <div key={insight} className="flex gap-3 text-sm leading-5 text-muted-foreground">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex h-11 items-center justify-between rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  <span className="flex items-center gap-3">
                    <link.icon className="h-4 w-4 text-muted-foreground" />
                    {link.title}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-border bg-background p-4 transition hover:border-foreground hover:shadow-sm"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-background">
          <Icon className="h-4 w-4" />
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {eyebrow}
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
