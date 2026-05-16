"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";

import { LaunchCountdown } from "@/components/landing/LaunchCountdown";
import { WaitlistPanel } from "@/components/landing/WaitlistPanel";
import { launchDateLabel, waitlistUrl } from "@/lib/launch";

export function CTA() {
  return (
    <section id="waitlist" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-5xl px-6 relative z-10">
        <div className="duo-card p-6 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-40" />

          <div className="max-w-4xl mx-auto space-y-10 relative z-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-primary/20 bg-primary/5 text-primary font-extrabold uppercase tracking-widest text-[10px]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Waitlist now open</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-foreground tracking-tight leading-[1.1]">
                Debo public preview opens <br />
                <span className="text-primary">{launchDateLabel}.</span>
              </h2>
              <p className="text-base text-muted-foreground font-semibold max-w-xl mx-auto leading-relaxed">
                Join the waitlist to get early access to the private memory dashboard, voice capture, characters, insights, and cited chat.
              </p>
            </div>

            <WaitlistPanel />

            <div id="launch" className="rounded-2xl border-2 border-border bg-muted/30 p-6 text-left">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary/20 bg-primary/5 text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-primary">Launch countdown</div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground">Public preview timer</h3>
                </div>
              </div>
              <LaunchCountdown />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link href={waitlistUrl} target="_blank" rel="noopener noreferrer" className="minimal-btn-primary px-8 py-3 text-sm w-full sm:w-auto">
                Join waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="#launch" className="minimal-btn-outline px-8 py-3 text-sm w-full sm:w-auto">
                Launch timer
              </Link>
            </div>

            <div className="pt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-border/50">
                <TrustItem label="Encrypted" />
                <TrustItem label="Open Source" />
                <TrustItem label="Cited Answers" />
                <TrustItem label="Free to start" />
            </div>

            <div className="pt-8 flex flex-wrap justify-center gap-6 items-center border-t border-border/50">
              <Link href="/privacy" className="text-[10px] font-extrabold text-muted-foreground/40 hover:text-primary transition-colors uppercase tracking-widest">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[10px] font-extrabold text-muted-foreground/40 hover:text-primary transition-colors uppercase tracking-widest">
                Terms of Service
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-extrabold text-muted-foreground/40 hover:text-primary transition-colors uppercase tracking-widest">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/50">{label}</span>
    </div>
  );
}
