"use client";

import { ArrowRight, Brain, Search, Shield, Zap, User, Clock } from "lucide-react";
import { waitlistUrl } from "@/lib/launch";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-20 md:pt-24 md:pb-28">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(88,204,2,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(88,204,2,0.12),transparent_70%)]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
          {/* Left — Minimal copy */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Private preview
            </div>

            <h1 className="font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Remember everything.{" "}
              <span className="text-primary">Ask anything.</span>
            </h1>

            <p className="mx-auto max-w-md text-base font-medium leading-relaxed text-muted-foreground md:text-lg lg:mx-0">
              Debo turns your notes, voice, and conversations into a
              private memory graph with cited answers.
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

            <p className="text-xs font-semibold text-muted-foreground/50">
              Free to join. Early access starts soon.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-5 pt-2 lg:justify-start">
              <TrustBadge icon={Shield} label="End-to-end private" />
              <TrustBadge icon={Brain} label="Your data stays yours" />
              <TrustBadge icon={Search} label="Source-cited answers" />
            </div>
          </div>

          {/* Right — Chat messages appearing */}
          <div className="relative w-full max-w-lg flex-1">
            <div className="absolute -inset-8 rounded-3xl bg-gradient-to-br from-primary/8 via-transparent to-transparent blur-2xl dark:from-primary/15" />

            <div className="relative space-y-3">
              {/* User message 1 */}
              <ChatMessage
                sender="You"
                delay="0s"
                text="Met Sarah after standup. She can review the hiring plan by Friday. Ask Raj for the Q4 budget before Tuesday."
              />

              {/* Debo processing */}
              <div
                className="flex items-center gap-2 px-1 opacity-0 animate-[fadeInUp_0.4s_ease_forwards]"
                style={{ animationDelay: "0.6s" }}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary">
                  <Brain className="h-3 w-3 text-primary-foreground" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary/70">
                  Extracting memories...
                </span>
              </div>

              {/* Extracted chips */}
              <div
                className="flex flex-wrap gap-2 opacity-0 animate-[fadeInUp_0.4s_ease_forwards]"
                style={{ animationDelay: "1s" }}
              >
                <EntityChip icon={<User className="h-3 w-3" />} label="Sarah Chen" />
                <EntityChip icon={<Zap className="h-3 w-3" />} label="Review by Friday" />
                <EntityChip icon={<User className="h-3 w-3" />} label="Raj" />
                <EntityChip icon={<Clock className="h-3 w-3" />} label="Before Tuesday" />
              </div>

              {/* User asks later */}
              <ChatMessage
                sender="You"
                delay="1.5s"
                text="What do I owe Sarah?"
              />

              {/* Debo answer */}
              <div
                className="duo-card border-primary/20 bg-primary/5 p-4 dark:bg-primary/10 opacity-0 animate-[fadeInUp_0.5s_ease_forwards]"
                style={{ animationDelay: "2s" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary">
                    <Search className="h-2.5 w-2.5 text-primary-foreground" />
                  </div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary/80">
                    Debo answer
                  </span>
                  <span className="ml-auto text-[9px] font-extrabold tabular-nums text-primary/50">
                    12ms
                  </span>
                </div>
                <p className="text-sm font-semibold leading-relaxed text-foreground">
                  Sarah is reviewing the hiring plan. You asked her to complete
                  it by Friday. You also need Raj&apos;s Q4 budget before
                  Tuesday.
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

function ChatMessage({
  sender,
  text,
  delay,
}: {
  sender: string;
  text: string;
  delay: string;
}) {
  return (
    <div
      className="duo-card p-4 opacity-0 animate-[fadeInUp_0.4s_ease_forwards]"
      style={{ animationDelay: delay }}
    >
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/50 mb-1.5 block">
        {sender}
      </span>
      <p className="text-sm font-medium leading-relaxed text-foreground/85">
        {text}
      </p>
    </div>
  );
}

function EntityChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary/15 bg-primary/5 px-2.5 py-1 text-[10px] font-bold text-primary/80">
      {icon}
      {label}
    </span>
  );
}

function SourceChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border-2 border-primary/15 bg-background/80 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-widest text-primary/60 dark:border-primary/25 dark:bg-background/60">
      {label}
    </span>
  );
}

function TrustBadge({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
      <Icon className="h-3 w-3" />
      {label}
    </div>
  );
}
