"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Brain, Mic, MessageSquare } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-duo-macaw/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-duo-feather/5 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-5xl px-6 relative z-10">
        <div className="bg-duo-eel rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden border-[12px] border-white/10 shadow-2xl">
          {/* Animated Background Icons */}
          <div className="absolute top-10 left-10 opacity-10 animate-float">
            <Mic className="w-16 h-16 text-white" />
          </div>
          <div className="absolute bottom-10 right-10 opacity-10 animate-float-delayed">
            <MessageSquare className="w-16 h-16 text-white" />
          </div>

          <div className="max-w-3xl mx-auto space-y-10 relative z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px]">
                <Sparkles className="h-3.5 w-3.5 text-duo-canary" />
                <span>Zero Context Required</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-heading font-black text-white leading-[1.1]">
                Stop forgetting. <br />
                <span className="text-duo-canary">Start remembering.</span>
              </h2>
              <p className="text-xl text-white/70 font-bold max-w-xl mx-auto leading-relaxed">
                Join the early adopters building their private memory engine today. It takes 10 seconds to record your first memory.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
              <Link
                href="/join"
                className="duo-btn duo-btn--primary px-10 py-5 text-xl w-full sm:w-auto shadow-[0_6px_0_var(--duo-feather-shadow)]"
              >
                Record your first memory
              </Link>
              <Link
                href="https://github.com/SH20RAJ/debo"
                target="_blank"
                className="flex items-center gap-2 text-white/60 hover:text-white font-black uppercase tracking-widest text-xs transition-colors"
              >
                View on GitHub
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="pt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-white/10">
               <TrustItem label="Encrypted" />
               <TrustItem label="Open Source" />
               <TrustItem label="Private" />
               <TrustItem label="Free to start" />
            </div>

            <div className="pt-8 flex flex-wrap justify-center gap-8 items-center border-t border-white/10">
              <Link
                href="/privacy"
                className="text-xs font-black text-white/40 hover:text-white transition-colors uppercase tracking-[0.2em]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-xs font-black text-white/40 hover:text-white transition-colors uppercase tracking-[0.2em]"
              >
                Terms of Service
              </Link>
              <Link
                href="https://discord.gg/uMv4dyhs"
                className="text-xs font-black text-white/40 hover:text-white transition-colors uppercase tracking-[0.2em]"
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
      <div className="w-1.5 h-1.5 rounded-full bg-duo-canary" />
      <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{label}</span>
    </div>
  );
}