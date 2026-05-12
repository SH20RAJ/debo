"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Brain, Mic, MessageSquare } from "lucide-react";

export function CTA() {
  return (
    <section className="py-40 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-5xl px-6 relative z-10">
        <div className="bg-foreground rounded-2xl p-12 md:p-24 text-center relative overflow-hidden border border-border shadow-sm">
          
          <div className="max-w-3xl mx-auto space-y-12 relative z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/10 text-background font-medium tracking-tight text-[10px]">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Zero Context Required</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-heading font-semibold text-background tracking-tight leading-[1.1]">
                Stop forgetting. <br />
                <span className="text-primary/80">Start remembering.</span>
              </h2>
              <p className="text-lg text-background/60 font-medium max-w-xl mx-auto leading-relaxed">
                Join the early adopters building their private memory engine today. It takes 10 seconds to record your first memory.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
              <Link
                href="/join"
                className="minimal-btn-primary px-10 py-3.5 text-base w-full sm:w-auto"
              >
                Record your first memory
              </Link>
              <Link
                href="https://github.com/SH20RAJ/debo"
                target="_blank"
                className="flex items-center gap-2 text-background/40 hover:text-background font-semibold tracking-tight text-xs transition-colors"
              >
                View on GitHub
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="pt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-background/5">
               <TrustItem label="Encrypted" />
               <TrustItem label="Open Source" />
               <TrustItem label="Private" />
               <TrustItem label="Free to start" />
            </div>

            <div className="pt-10 flex flex-wrap justify-center gap-8 items-center border-t border-background/5">
              <Link
                href="/privacy"
                className="text-[10px] font-semibold text-background/30 hover:text-background transition-colors uppercase tracking-widest"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-[10px] font-semibold text-background/30 hover:text-background transition-colors uppercase tracking-widest"
              >
                Terms of Service
              </Link>
              <Link
                href="https://discord.gg/uMv4dyhs"
                className="text-[10px] font-semibold text-background/30 hover:text-background transition-colors uppercase tracking-widest"
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
      <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-background/40">{label}</span>
    </div>
  );
}