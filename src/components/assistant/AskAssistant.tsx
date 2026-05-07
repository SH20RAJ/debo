"use client";

import { Thread, ThreadList } from "@assistant-ui/react-ui";
import { ThreadPrimitive } from "@assistant-ui/react";
import Image from "next/image";
import Link from "next/link";
import { DeboToolUIs } from "./DeboToolUIs";
import {
  BookOpen,
  Brain,
  Search,
  Clock,
  TrendingUp,
  Sparkles,
  MessageSquareText,
  ShieldCheck,
  Activity,
  LayoutDashboard,
} from "lucide-react";

const suggestions = [
  {
    icon: BookOpen,
    title: "Save a journal",
    prompt: "I want to write a new journal entry about my day",
  },
  {
    icon: Brain,
    title: "Recall memories",
    prompt: "What do you remember about me?",
  },
  {
    icon: Search,
    title: "Search journals",
    prompt: "Search my journals for entries about work",
  },
  {
    icon: Clock,
    title: "View timeline",
    prompt: "Show me my timeline from this week",
  },
  {
    icon: TrendingUp,
    title: "Find patterns",
    prompt: "What patterns do you see in my recent entries?",
  },
  {
    icon: Sparkles,
    title: "Daily check-in",
    prompt: "Let's do a daily check-in. How should I start?",
  },
];

function WelcomeScreen() {
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-center px-5 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 rounded-lg border border-white/10 bg-white/5 p-2 shadow-sm">
          <Image
            src="/mascot.png"
            alt="Debo"
            fill
            className="object-contain p-2"
            sizes="64px"
            priority
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
            Debo online
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-normal text-white sm:text-4xl">
            What shall we inspect?
          </h1>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((s, i) => (
          <ThreadPrimitive.Suggestion
            key={i}
            prompt={s.prompt}
            autoSend
            asChild
          >
            <button className="group flex min-h-16 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition hover:border-emerald-300/40 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-black/25 text-emerald-300 transition group-hover:text-amber-200">
                <s.icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.14em] text-white/85">
                {s.title}
              </span>
            </button>
          </ThreadPrimitive.Suggestion>
        ))}
      </div>
    </div>
  );
}

export function AskAssistant() {
  return (
    <div className="debo-ask flex h-full min-h-0 bg-[#071112] text-white">
      <aside className="hidden w-[316px] shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#091416] lg:flex">
        <div className="px-5 pb-4 pt-12">
          <div className="flex items-center gap-3 pl-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-emerald-300">
              <MessageSquareText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35">
                Chat
              </p>
              <p className="truncate text-sm font-extrabold text-white/85">
                Thread memory
              </p>
            </div>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
          <ThreadList />
        </div>
      </aside>

      <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 bg-[#091416]/95 px-5 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3 pl-10 lg:pl-0">
            <div className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300/50" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-300" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-black uppercase tracking-[0.16em] text-white sm:text-xl">
                Debo Chat
              </h1>
              <p className="hidden text-xs font-bold text-white/45 sm:block">
                Thread locked. Memory online.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              aria-label="Open command center"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-emerald-300/40 hover:text-emerald-200"
            >
              <LayoutDashboard className="h-4 w-4" />
            </Link>
            <div className="hidden items-center gap-2 rounded-md border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-200 sm:flex">
              <ShieldCheck className="h-3.5 w-3.5" />
              Active
            </div>
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-hidden px-3 py-3 sm:px-5 lg:px-8">
          <div className="relative mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0b0e10] shadow-2xl shadow-black/20">
            <DeboToolUIs />
            <Thread
              assistantAvatar={{ src: "/mascot.png", alt: "Debo", fallback: "D" }}
              composer={{ allowAttachments: true }}
              strings={{
                composer: {
                  input: { placeholder: "Message Debo..." },
                },
              }}
              welcome={{
                message: <WelcomeScreen /> as any,
              }}
            />
            <div className="pointer-events-none absolute bottom-5 right-6 hidden items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-white/45 backdrop-blur xl:flex">
              <Activity className="h-3 w-3 text-emerald-300" />
              Live
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
