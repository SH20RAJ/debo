"use client";

import { ArrowRight, Brain, Search, Shield, Zap, User, Mic } from "lucide-react";
import { waitlistUrl } from "@/lib/launch";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-16 md:pt-28 md:pb-24">
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(88,204,2,0.06),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(88,204,2,0.1),transparent_60%)]" />

      <div className="container relative z-10 mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:gap-20">
          {/* Left — Copy */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Private preview opens 17 September 2026
            </div>

            <h1 className="font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Your private AI memory, built around the life you actually capture.
            </h1>

            <p className="mx-auto max-w-lg text-base font-medium leading-relaxed text-muted-foreground md:text-lg lg:mx-0">
              Debo turns voice notes, journals, chats, people, promises, and
              decisions into a searchable memory graph — so you can ask what
              happened later and get answers backed by your own sources.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <a
                href={waitlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="minimal-btn-primary px-7 py-2.5 text-sm inline-flex items-center gap-2"
              >
                Join the waitlist
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <p className="text-xs font-semibold text-muted-foreground/60">
              Early access starts before public preview. Free to join.
            </p>
          </div>

          {/* Right — Animated memory visualization */}
          <div className="relative w-full max-w-md flex-1">
            <div className="absolute -inset-8 rounded-3xl bg-gradient-to-br from-primary/8 via-transparent to-transparent blur-2xl dark:from-primary/15" />

            <div className="relative space-y-3">
              {/* Memory capture card */}
              <div className="duo-card p-5 animate-[float_6s_ease-in-out_infinite]">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/70">
                    Memory capture
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border-2 border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-primary">
                    <Mic className="h-2.5 w-2.5" />
                    Live
                  </div>
                </div>
                <div className="rounded-xl border-2 border-border/50 bg-muted/40 p-3.5">
                  <p className="text-sm font-semibold italic leading-relaxed text-foreground/85">
                    &ldquo;Met Sarah after standup. She can review the hiring
                    plan by Friday. Ask Raj for the Q4 budget before
                    Tuesday.&rdquo;
                  </p>
                </div>
              </div>

              {/* Extracted memory cards */}
              <div className="grid grid-cols-2 gap-3">
                <MemoryChip
                  icon={<User className="h-3.5 w-3.5" />}
                  label="Person"
                  value="Sarah Chen"
                  delay="0.1s"
                />
                <MemoryChip
                  icon={<Zap className="h-3.5 w-3.5" />}
                  label="Promise"
                  value="Hiring plan"
                  delay="0.2s"
                />
                <MemoryChip
                  icon={<Search className="h-3.5 w-3.5" />}
                  label="Date"
                  value="Before Tuesday"
                  delay="0.3s"
                />
                <MemoryChip
                  icon={<Shield className="h-3.5 w-3.5" />}
                  label="Source"
                  value="Voice note"
                  delay="0.4s"
                />
              </div>

              {/* AI answer card */}
              <div className="duo-card border-primary/20 bg-primary/5 p-5 dark:bg-primary/10 animate-[float_6s_ease-in-out_infinite_0.5s]">
                <div className="flex items-center gap-1.5 mb-3">
                  <Brain className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80">
                    Debo answer
                  </span>
                </div>
                <p className="text-sm font-semibold leading-relaxed text-foreground">
                  Sarah is tied to the Q4 hiring plan. You asked her for review
                  by Friday and still need Raj&apos;s budget before Tuesday.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <SourceChip label="Voice note" />
                  <SourceChip label="Standup" />
                  <SourceChip label="Q4 hiring" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MemoryChip({
  icon,
  label,
  value,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: string;
}) {
  return (
    <div
      className="duo-card p-3.5 opacity-0 animate-[fadeInUp_0.5s_ease_forwards]"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground/50">
        {icon}
        <span className="text-[9px] font-extrabold uppercase tracking-[0.2em]">
          {label}
        </span>
      </div>
      <div className="text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}

function SourceChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border-2 border-primary/15 bg-background px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-primary/70 dark:border-primary/25 dark:bg-background/80">
      {label}
    </span>
  );
}
