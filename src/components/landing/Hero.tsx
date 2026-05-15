"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

type HeroProps = {
  isSignedIn?: boolean;
};

const points = ["Private memory", "Cited recall", "Voice and journal ready"];

export function Hero({ isSignedIn = false }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/10 bg-background px-6 py-24 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-primary/5 to-transparent" />

      <div className="container relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex rounded-full border border-border/60 bg-card px-4 py-2 text-xs font-semibold text-muted-foreground shadow-sm">
            Private AI memory for your real life
          </div>

          <h1 className="font-heading text-5xl font-semibold tracking-[-0.045em] text-foreground sm:text-6xl lg:text-7xl">
            A memory layer for everything you do.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground sm:text-xl">
            Debo turns journals, voice notes, chats, and people into searchable context, so you can ask what happened and get answers with sources.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={isSignedIn ? "/dashboard" : "/join"} className="minimal-btn-primary px-7 py-3 text-base">
              Start building memory
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="#how-it-works" className="minimal-btn-outline px-7 py-3 text-base">
              See how it works
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium text-muted-foreground">
            {points.map((point) => (
              <div key={point} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary/70" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-4xl rounded-3xl border border-border bg-card/70 p-3 shadow-2xl shadow-primary/5 backdrop-blur-sm">
          <div className="rounded-2xl border border-border/60 bg-background p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-border/50 pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground/50">Debo recall</div>
                <div className="mt-1 text-sm font-semibold text-foreground">Question answered from your sources</div>
              </div>
              <div className="hidden rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-bold text-primary sm:block">
                3 sources found
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground/50">You asked</div>
                <p className="mt-3 text-lg font-semibold leading-snug text-foreground">
                  &ldquo;What do I owe Sarah this week?&rdquo;
                </p>
              </div>

              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-primary/60">Debo remembered</div>
                <p className="mt-3 text-sm font-medium leading-relaxed text-foreground">
                  You promised Sarah the Q4 hiring plan by Friday, and you still need Raj&apos;s budget numbers before Tuesday.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Source label="Voice note" />
                  <Source label="Journal" />
                  <Source label="Chat" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Source({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
      {label}
    </span>
  );
}
