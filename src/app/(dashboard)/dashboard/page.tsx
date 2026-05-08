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
  description: "Debo Studio for chat, capture, journaling, and memory.",
};

export default async function DashboardPage() {
  const userId = await resolveUserId(undefined, true);
  if (!userId) redirect("/join");

  const user = await stackServerApp.getUser();
  if (!user) redirect("/join");

  const [journalCount, timeline, initialGraph] = await Promise.all([
    getJournalsCount(undefined, userId),
    getLifeTimeline(userId, "daily"),
    queryGraph("What patterns stand out in my life?", userId),
  ]);

  let graph = initialGraph;

  if (!graph.topPeople.length && journalCount > 0) {
    await refreshMemoryGraph(userId);
    graph = await queryGraph("What patterns stand out in my life?", userId);
  }

  const recentTimeline = timeline.slice(-4).reverse();
  const firstName = (user.displayName ?? "there").split(" ")[0];
  const signalCount =
    graph.topPeople.length + graph.topTopics.length + graph.topEmotions.length;

  const actions = [
    {
      title: "Chat",
      text: "Talk to Debo.",
      href: "/chat",
      icon: MessageSquareText,
      tone: "green" as const,
    },
    {
      title: "Capture",
      text: "Record audio, video, or pages.",
      href: "/dashboard/capture",
      icon: Mic2,
      tone: "blue" as const,
    },
    {
      title: "Write",
      text: "Start a journal.",
      href: "/dashboard/journal/new",
      icon: PenLine,
      tone: "orange" as const,
    },
    {
      title: "Review",
      text: "See patterns.",
      href: "/dashboard/insights",
      icon: ChartNoAxesCombined,
      tone: "purple" as const,
    },
  ];

  const captureModes = [
    { title: "Audio note", text: "Speak fast.", icon: Mic2, tone: "green" as const },
    { title: "Video note", text: "Record a vlog.", icon: Video, tone: "blue" as const },
    { title: "Page scan", text: "Upload diary pages.", icon: FileImage, tone: "orange" as const },
  ];

  const metrics = [
    { label: "Journals", value: journalCount.toString(), text: "saved" },
    { label: "Recent", value: recentTimeline.length.toString(), text: "groups" },
    { label: "Patterns", value: graph.patterns.length.toString(), text: "found" },
    { label: "Signals", value: signalCount.toString(), text: "active" },
  ];

  const quickLinks = [
    { title: "Archive", href: "/dashboard/journals", icon: Library },
    { title: "Timeline", href: "/dashboard/timeline", icon: CalendarClock },
    { title: "Memories", href: "/dashboard/memories", icon: Database },
    { title: "MCP", href: "/dashboard/mcp", icon: Cpu },
  ];

  return (
    <div className="min-h-full bg-duo-polar">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 lg:px-8">
        <header className="duo-card overflow-hidden p-0">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-duo-feather bg-duo-green/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-duo-green">
                <span className="h-3 w-3 rounded-full bg-duo-green" />
                Ready
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-heading font-black tracking-tight text-duo-eel md:text-6xl">
                  Hi, {firstName}.
                </h1>
                <p className="max-w-2xl text-lg font-bold leading-7 text-duo-wolf">
                  Pick one thing. Debo will keep the memory clean.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="duolingo" size="lg">
                <Link href="/chat">
                  <MessageSquareText className="mr-2 h-5 w-5" />
                  Chat
                </Link>
              </Button>
              <Button asChild variant="duolingo-outline" size="lg">
                <Link href="/dashboard/capture">
                  <Mic2 className="mr-2 h-5 w-5" />
                  Capture
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {actions.map((action) => (
            <ActionCard key={action.href} {...action} />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <SectionTitle label="Capture" title="Fast journal ways" />
            <div className="grid gap-4 md:grid-cols-3">
              {captureModes.map((mode) => (
                <Link key={mode.title} href="/dashboard/capture" className="duo-card group p-5">
                  <ToneIcon icon={mode.icon} tone={mode.tone} />
                  <div className="mt-5 space-y-1">
                    <h3 className="text-lg font-heading font-black uppercase tracking-wider text-duo-eel">
                      {mode.title}
                    </h3>
                    <p className="text-sm font-bold text-duo-wolf">{mode.text}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="duo-card">
            <div className="mb-5 flex items-center gap-3">
              <ToneIcon icon={Search} tone="blue" />
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-duo-swan">
                  Memory
                </div>
                <h2 className="text-xl font-heading font-black text-duo-eel">Status</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border-2 border-duo-swan bg-background p-4 text-center">
                  <div className="text-3xl font-heading font-black text-duo-eel">{metric.value}</div>
                  <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-duo-swan">
                    {metric.label}
                  </div>
                  <div className="text-xs font-bold text-duo-wolf">{metric.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <SectionTitle label="Recent" title="Latest memory" />
            <div className="space-y-3">
              {recentTimeline.length > 0 ? (
                recentTimeline.map((entry, index) => (
                  <Link
                    key={`${entry.grouping}-${entry.date}`}
                    href={entry.journalIds[0] ? `/dashboard/journal/${entry.journalIds[0]}` : "/dashboard/timeline"}
                    className="duo-card group grid gap-3 p-5 sm:grid-cols-[110px_1fr_auto] sm:items-center"
                  >
                    <div className="rounded-2xl border-2 border-duo-swan bg-duo-polar px-3 py-2 text-center text-xs font-black uppercase tracking-wider text-duo-wolf">
                      {format(new Date(`${entry.date}T00:00:00.000Z`), "MMM d")}
                    </div>
                    <div className="min-w-0">
                      <div className="line-clamp-2 text-base font-black text-duo-eel">
                        {entry.summary}
                      </div>
                      <div className="mt-1 line-clamp-1 text-sm font-bold text-duo-wolf">
                        {entry.events.slice(0, 2).join(" / ") || entry.label}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-duo-swan">
                      {index === 0 ? <Sparkles className="h-4 w-4 text-duo-blue" /> : null}
                      {entry.journalIds.length} note{entry.journalIds.length === 1 ? "" : "s"}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="duo-card p-8 text-center">
                  <CalendarClock className="mx-auto mb-4 h-10 w-10 text-duo-swan" />
                  <h3 className="text-xl font-heading font-black text-duo-eel">No notes yet</h3>
                  <p className="mt-1 text-sm font-bold text-duo-wolf">
                    Capture or write your first journal.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="duo-card">
              <SectionTitle label="Insights" title="Quick read" compact />
              <div className="mt-4 space-y-3">
                {(graph.insights.length > 0
                  ? graph.insights.slice(0, 3)
                  : ["Add a few journals and Debo will show patterns here."]
                ).map((insight) => (
                  <div key={insight} className="flex gap-3 rounded-2xl border-2 border-duo-swan bg-background p-3 text-sm font-bold leading-5 text-duo-wolf">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-duo-green" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="btn-3d btn-3d-white flex h-14 items-center justify-between rounded-2xl border-2 border-duo-swan bg-background px-4 text-sm font-black uppercase tracking-wider text-duo-eel transition hover:bg-duo-polar"
                >
                  <span className="flex items-center gap-3">
                    <link.icon className="h-5 w-5 text-duo-blue" />
                    {link.title}
                  </span>
                  <ArrowRight className="h-4 w-4 text-duo-swan" />
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
  text,
  href,
  icon,
  tone,
}: {
  title: string;
  text: string;
  href: string;
  icon: LucideIcon;
  tone: "green" | "blue" | "orange" | "purple";
}) {
  return (
    <Link href={href} className="duo-card group p-5">
      <div className="flex items-center justify-between">
        <ToneIcon icon={icon} tone={tone} />
        <ArrowRight className="h-5 w-5 text-duo-swan transition group-hover:translate-x-1 group-hover:text-duo-blue" />
      </div>
      <div className="mt-6 space-y-1">
        <h2 className="text-xl font-heading font-black uppercase tracking-wider text-duo-eel">
          {title}
        </h2>
        <p className="text-sm font-bold text-duo-wolf">{text}</p>
      </div>
    </Link>
  );
}

function ToneIcon({
  icon: Icon,
  tone,
}: {
  icon: LucideIcon;
  tone: "green" | "blue" | "orange" | "purple";
}) {
  const toneClass = {
    green: "border-duo-feather bg-duo-green/10 text-duo-green",
    blue: "border-duo-macaw bg-duo-blue/10 text-duo-blue",
    orange: "border-duo-fox bg-duo-orange/10 text-duo-orange",
    purple: "border-duo-beetle bg-duo-purple/10 text-duo-purple",
  }[tone];

  return (
    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 ${toneClass}`}>
      <Icon className="h-6 w-6" />
    </div>
  );
}

function SectionTitle({
  label,
  title,
  compact = false,
}: {
  label: string;
  title: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <div className="text-xs font-black uppercase tracking-[0.2em] text-duo-swan">{label}</div>
      <h2 className="text-2xl font-heading font-black uppercase tracking-wider text-duo-eel">
        {title}
      </h2>
    </div>
  );
}
