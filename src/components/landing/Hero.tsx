"use client";

import Link from "next/link";
import { ArrowRight, Shield, CheckCircle2, User, Calendar, Sparkles, Mic, Brain, MessageSquare, Search } from "lucide-react";

type HeroProps = {
  isSignedIn?: boolean;
};

export function Hero({ isSignedIn = false }: HeroProps) {
  return (
    <section className="relative bg-background px-6 pt-20 pb-32 overflow-hidden">
      {/* Subtle Background Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Left Side: Content */}
          <div className="flex-1 space-y-10 text-center lg:text-left">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary font-medium tracking-tight text-xs">
                <Brain className="h-3.5 w-3.5" />
                <span>Personal Intelligence Engine</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-heading font-semibold text-foreground tracking-tight leading-[1.1]">
                Your personal <br />
                <span className="text-primary/80">memory engine.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Record thoughts, journals, and voice notes. Debo extracts the context so you can ask what happened, what changed, and what you promised.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                href={isSignedIn ? "/dashboard" : "/join"}
                className="minimal-btn-primary px-8 py-3 text-base"
              >
                Start recording
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="minimal-btn-outline px-8 py-3 text-base"
              >
                View demo
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 text-muted-foreground/60 pt-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-xs font-medium tracking-tight">Private by design</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-medium tracking-tight">Evidence-backed</span>
              </div>
            </div>
          </div>

          {/* Right Side: Minimal Demo Representation */}
          <div className="flex-1 w-full max-w-xl relative">
            <div className="relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 shadow-sm space-y-8">
              
              {/* Capture Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Mic className="w-3.5 h-3.5" />
                    Input
                  </div>
                  <div className="text-[10px] font-medium text-muted-foreground/40">Voice • Today</div>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                  <p className="text-sm font-medium text-foreground/80 italic leading-snug">
                    "Met Sarah. Prioritize hiring senior engineers for Q4. Follow up Tuesday."
                  </p>
                </div>
              </div>

              {/* Extraction Visualization */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-border/50" />
                <div className="flex items-center gap-1.5 text-[9px] font-semibold text-primary/60 uppercase tracking-widest">
                  <Brain className="w-3 h-3" />
                  Processing
                </div>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              {/* Entity Extraction */}
              <div className="grid grid-cols-2 gap-3">
                <div className="px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 space-y-1">
                  <div className="text-[8px] font-semibold uppercase text-primary/60 tracking-wider">Person</div>
                  <div className="font-semibold text-xs text-foreground">Sarah Chen</div>
                </div>
                <div className="px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 space-y-1">
                  <div className="text-[8px] font-semibold uppercase text-primary/60 tracking-wider">Focus</div>
                  <div className="font-semibold text-xs text-foreground">Senior Hiring</div>
                </div>
              </div>

              {/* Query & Insight */}
              <div className="space-y-4 pt-4 border-t border-border/30">
                <div className="flex items-start gap-3 flex-row-reverse">
                   <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                     <User className="w-3.5 h-3.5 text-muted-foreground" />
                   </div>
                   <div className="px-4 py-2 bg-background border border-border rounded-xl rounded-tr-none">
                     <p className="text-xs font-medium text-foreground">"What did we discuss?"</p>
                   </div>
                </div>

                <div className="flex items-start gap-3">
                   <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                     <Sparkles className="w-3.5 h-3.5 text-primary" />
                   </div>
                   <div className="flex-1 space-y-2">
                     <div className="p-4 bg-muted/50 border border-border/50 rounded-xl rounded-tl-none">
                       <p className="text-xs font-medium text-foreground leading-relaxed">
                         Discussion focused on <span className="text-primary font-semibold">senior engineer hiring</span> for Q4.
                       </p>
                     </div>
                   </div>
                </div>
              </div>

            </div>

            {/* Subtle Badge */}
            <div className="absolute -bottom-4 -right-4 bg-background border border-border px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 z-20">
               <Shield className="w-3.5 h-3.5 text-primary/60" />
               <span className="text-[10px] font-semibold tracking-tight text-muted-foreground">End-to-end encrypted</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
