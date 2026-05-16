"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Shield,
  CheckCircle2,
  User,
  Mic,
  Brain,
  Search,
  Network,
  type LucideIcon,
} from "lucide-react";

import { launchDateLabel, waitlistUrl } from "@/lib/launch";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background px-6 pb-28 pt-16 sm:pt-20 lg:pb-36">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.24),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_32%)]" />
      <div className="pointer-events-none absolute left-1/2 top-20 h-64 w-[min(900px,90vw)] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />

      <div className="container relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:gap-24">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold tracking-tight text-primary shadow-sm shadow-primary/5 dark:border-primary/25 dark:bg-primary/10">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Public preview opens {launchDateLabel}</span>
              </div>
              <h1 className="font-heading text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground md:text-7xl lg:text-8xl">
                Remember every detail that <span className="text-primary/80 dark:text-primary">matters.</span>
              </h1>
              <p className="mx-auto max-w-xl text-lg font-medium leading-relaxed text-muted-foreground md:text-xl lg:mx-0">
                Debo turns journals, voice notes, chats, and people into a searchable memory graph. Ask what happened, recover decisions, and follow through with answers backed by your own sources.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link href={waitlistUrl} target="_blank" rel="noopener noreferrer" className="minimal-btn-primary px-8 py-3 text-base">
                Join the waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="#launch" className="minimal-btn-outline px-8 py-3 text-base">
                See launch timer
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:justify-start">
              <TrustPill icon={Shield} label="Private by design" />
              <TrustPill icon={Search} label="Cited answers" />
              <TrustPill icon={Network} label="Graph memory" />
            </div>
          </div>

          <div className="relative w-full max-w-xl flex-1">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-muted/60 blur-2xl dark:from-primary/20 dark:to-sky-950/40" />
            <div className="relative rounded-3xl border border-border bg-card/80 p-4 shadow-2xl shadow-primary/10 backdrop-blur-xl dark:bg-card/75 dark:shadow-primary/15 sm:p-6 lg:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 dark:text-primary/80">Memory capture</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">Today, 9:42 AM</div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary/70 dark:bg-primary/10 dark:text-primary">
                  <Mic className="h-3 w-3" />
                  Live
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 dark:bg-muted/45">
                  <div className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    <span>Voice note</span>
                    <span>42 sec</span>
                  </div>
                  <p className="text-sm font-medium italic leading-relaxed text-foreground/85">
                    &ldquo;Met Sarah after standup. She can review the hiring plan by Friday. Ask Raj for the Q4 budget before Tuesday.&rdquo;
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <MemoryCard label="Person" value="Sarah Chen" />
                  <MemoryCard label="Promise" value="Hiring plan" />
                  <MemoryCard label="Date" value="Before Tuesday" />
                  <MemoryCard label="Source" value="Voice note" />
                </div>

                <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 dark:border-primary/25 dark:bg-primary/10">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary/70 dark:text-primary">
                    <Brain className="h-3.5 w-3.5" />
                    Debo answer
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-foreground">
                    Sarah is tied to the Q4 hiring plan. You asked her for review by Friday and still need Raj&apos;s budget before Tuesday.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <SourceChip label="Voice note" />
                    <SourceChip label="Standup" />
                    <SourceChip label="Q4 hiring" />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-border/50 bg-background p-4 dark:bg-background/70">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Ask later</div>
                    <p className="mt-1 text-sm font-semibold text-foreground">&ldquo;What do I owe Sarah this week?&rdquo;</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-2 flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 shadow-sm dark:bg-card sm:-right-4">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cited recall</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-primary/70 dark:text-primary" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

function MemoryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background p-4 dark:bg-background/70">
      <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground/45">{label}</div>
      <div className="mt-2 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function SourceChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-primary/15 bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary/70 dark:border-primary/25 dark:bg-background/80 dark:text-primary">
      {label}
    </span>
  );
}
