"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";

import { LaunchCountdown } from "@/components/landing/LaunchCountdown";
import { WaitlistPanel } from "@/components/landing/WaitlistPanel";
import { launchDateLabel, waitlistUrl } from "@/lib/launch";

export function CTA() {
  return (
    <section id="waitlist" className="py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-5xl px-6 relative z-10">
        <div className="bg-card rounded-3xl p-6 md:p-12 text-center relative overflow-hidden border border-border shadow-2xl shadow-primary/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-40" />
          
          <div className="max-w-4xl mx-auto space-y-12 relative z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary font-bold uppercase tracking-widest text-[9px]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Waitlist now open</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-heading font-semibold text-foreground tracking-tight leading-[1.1]">
                Debo public preview opens <br />
                <span className="text-primary/60 italic">{launchDateLabel}.</span>
              </h2>
              <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
                Join the waitlist to get early access to the private memory dashboard, voice capture, characters, insights, and cited chat.
              </p>
            </div>

            <WaitlistPanel />

            <div id="launch" className="rounded-3xl border border-border/60 bg-background/70 p-6 text-left dark:bg-background/40">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/70">Launch countdown</div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">Public preview timer</h3>
                </div>
              </div>
              <LaunchCountdown />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
              <Link href={waitlistUrl} target="_blank" rel="noopener noreferrer" className="minimal-btn-primary px-10 py-4 text-base w-full sm:w-auto shadow-xl shadow-primary/20 hover:shadow-primary/30">
                Join waitlist
              </Link>
              <Link href="#launch" className="flex items-center gap-2 text-muted-foreground/40 hover:text-foreground font-bold uppercase tracking-widest text-[10px] transition-colors group">
                Launch timer
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="pt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-border/50">
                <TrustItem label="Encrypted" />
                <TrustItem label="Open Source" />
                <TrustItem label="Cited Answers" />
                <TrustItem label="Free to start" />
            </div>

            <div className="pt-10 flex flex-wrap justify-center gap-8 items-center border-t border-border/50">
              <Link
                href="/privacy"
                className="text-[10px] font-bold text-muted-foreground/20 hover:text-primary transition-colors uppercase tracking-[0.2em]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-[10px] font-bold text-muted-foreground/20 hover:text-primary transition-colors uppercase tracking-[0.2em]"
              >
                Terms of Service
              </Link>
              <Link
                href="https://discord.gg/uMv4dyhs"
                className="text-[10px] font-bold text-muted-foreground/20 hover:text-primary transition-colors uppercase tracking-[0.2em]"
              >
                Discord Community
              </Link>
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
      <div className="w-1 h-1 rounded-full bg-primary/40" />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">{label}</span>
    </div>
  );
}
