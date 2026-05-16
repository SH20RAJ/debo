"use client";

import { ArrowRight, Brain, Search, Shield, Zap, User, Mic, Sparkles, MessageSquare, Clock } from "lucide-react";
import { waitlistUrl } from "@/lib/launch";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-20 md:pt-24 md:pb-28">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(88,204,2,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(88,204,2,0.12),transparent_70%)]" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(88,204,2,0.04),transparent_60%)]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-6xl">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-primary/5 px-4 py-2 text-[11px] font-extrabold uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Private AI Memory System
          </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h1 className="font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-6xl xl:text-7xl">
            Remember everything.{" "}
            <span className="text-primary">Ask anything.</span>
          </h1>
        </div>

        {/* Subheadline */}
        <p className="text-center max-w-2xl mx-auto mb-10 text-base font-medium leading-relaxed text-muted-foreground md:text-lg">
          Debo captures your voice notes, journals, and conversations — then
          builds a private memory graph so you can recall what happened, who
          said what, and what matters. Backed by your own sources.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 mb-16">
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <a
              href={waitlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="minimal-btn-primary px-8 py-3 text-sm inline-flex items-center gap-2.5"
            >
              Join the waitlist
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#demo"
              className="minimal-btn-outline px-8 py-3 text-sm inline-flex items-center gap-2"
            >
              See how it works
            </a>
          </div>
          <p className="text-xs font-semibold text-muted-foreground/50">
            Free to join. Early access starts soon.
          </p>
        </div>

        {/* Memory Visualization */}
        <div className="relative max-w-3xl mx-auto">
          {/* Glow behind cards */}
          <div className="absolute -inset-12 bg-gradient-to-b from-primary/5 via-transparent to-transparent blur-3xl rounded-3xl" />

          <div className="relative grid gap-4 md:grid-cols-12">
            {/* Left column - Input */}
            <div className="md:col-span-5 space-y-4">
              {/* Voice capture card */}
              <div className="duo-card p-5 animate-[float_6s_ease-in-out_infinite]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                      <Mic className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground/60">
                        Voice capture
                      </div>
                      <div className="text-sm font-bold text-foreground">
                        Just now
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-red-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    Recording
                  </div>
                </div>
                <div className="rounded-xl border-2 border-border/40 bg-muted/30 p-4">
                  <p className="text-sm font-semibold italic leading-relaxed text-foreground/85">
                    &ldquo;Met Sarah after standup. She can review the hiring
                    plan by Friday. Ask Raj for the Q4 budget before
                    Tuesday.&rdquo;
                  </p>
                </div>
              </div>

              {/* Journal snippet */}
              <div className="duo-card p-4 animate-[float_6s_ease-in-out_infinite_1s]">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground/50">
                    Text journal
                  </span>
                </div>
                <p className="text-xs font-medium leading-relaxed text-foreground/70 line-clamp-2">
                  Great 1:1 with the team today. Need to follow up on the
                  product roadmap changes and schedule the design review...
                </p>
              </div>
            </div>

            {/* Center - Processing */}
            <div className="md:col-span-2 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                  <div className="relative flex items-center justify-center size-14 rounded-2xl bg-primary shadow-lg shadow-primary/25">
                    <Brain className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
                <div className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-primary/70">
                  Processing
                </div>
                {/* Connection lines (hidden on mobile) */}
                <div className="hidden md:block absolute top-1/2 left-[41%] w-[18%] h-px bg-gradient-to-r from-border/40 via-primary/30 to-border/40" />
              </div>
            </div>

            {/* Right column - Output */}
            <div className="md:col-span-5 space-y-4">
              {/* Extracted entities */}
              <div className="duo-card p-5 animate-[float_6s_ease-in-out_infinite_0.5s]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center justify-center size-7 rounded-lg bg-primary/10">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground/60">
                    Extracted memories
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <MemoryChip
                    icon={<User className="h-3 w-3" />}
                    label="Person"
                    value="Sarah Chen"
                    delay="0.2s"
                  />
                  <MemoryChip
                    icon={<Zap className="h-3 w-3" />}
                    label="Promise"
                    value="Review by Friday"
                    delay="0.3s"
                  />
                  <MemoryChip
                    icon={<User className="h-3 w-3" />}
                    label="Person"
                    value="Raj"
                    delay="0.4s"
                  />
                  <MemoryChip
                    icon={<Clock className="h-3 w-3" />}
                    label="Deadline"
                    value="Before Tuesday"
                    delay="0.5s"
                  />
                </div>
              </div>

              {/* AI Answer */}
              <div className="duo-card border-primary/25 bg-primary/5 p-5 dark:bg-primary/10 animate-[float_6s_ease-in-out_infinite_1.5s]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center justify-center size-7 rounded-lg bg-primary/15">
                    <Search className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-primary/80">
                    Ask Debo
                  </span>
                </div>
                <div className="rounded-lg bg-background/60 dark:bg-background/40 px-3 py-2 mb-3">
                  <p className="text-xs font-medium text-muted-foreground/70">
                    &ldquo;What do I owe Sarah?&rdquo;
                  </p>
                </div>
                <p className="text-sm font-semibold leading-relaxed text-foreground mb-3">
                  Sarah is reviewing the hiring plan. You asked her to complete
                  it by Friday. You also need Raj&apos;s Q4 budget before
                  Tuesday.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <SourceChip label="Voice note" />
                  <SourceChip label="Standup" />
                  <SourceChip label="Q4 hiring" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-16 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" />
            End-to-end private
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-3.5 w-3.5" />
            Your data stays yours
          </div>
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            Source-cited answers
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
      className="rounded-xl border-2 border-border/40 bg-muted/20 p-2.5 opacity-0 animate-[fadeInUp_0.5s_ease_forwards]"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-1 mb-1 text-muted-foreground/50">
        {icon}
        <span className="text-[8px] font-extrabold uppercase tracking-[0.15em]">
          {label}
        </span>
      </div>
      <div className="text-xs font-bold text-foreground truncate">{value}</div>
    </div>
  );
}

function SourceChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border-2 border-primary/15 bg-background/80 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-primary/70 dark:border-primary/25 dark:bg-background/60">
      <Shield className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}
