"use client";

import Link from "next/link";
import { ArrowRight, Shield, CheckCircle2, User, Calendar, Sparkles, Mic, Brain, MessageSquare, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type HeroProps = {
  isSignedIn?: boolean;
};

export function Hero({ isSignedIn = false }: HeroProps) {
  return (
    <section className="relative bg-background px-6 pt-12 pb-24 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-duo-macaw/5 to-transparent pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Side: Content */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-duo-macaw bg-duo-macaw/10 text-duo-macaw font-black uppercase tracking-[0.2em] text-[10px]">
                <Brain className="h-3.5 w-3.5" />
                <span>Personal Memory Engine</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-heading font-black text-duo-eel tracking-tight leading-[0.95]">
                Your personal <br />
                <span className="text-duo-feather">memory engine.</span>
              </h1>
              <p className="text-lg md:text-xl text-duo-wolf max-w-xl mx-auto lg:mx-0 font-bold leading-relaxed">
                Record thoughts, journals, voice notes, and calendar moments — then ask Debo what happened, what changed, and what you promised to do.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
              <Link
                href={isSignedIn ? "/dashboard" : "/join"}
                className="duo-btn duo-btn--primary group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 text-lg shadow-[0_6px_0_var(--duo-feather-shadow)]"
              >
                Record your first memory
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#how-it-works"
                className="duo-btn duo-btn--outline flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 text-lg border-duo-swan text-duo-wolf shadow-[0_6px_0_var(--duo-swan)]"
              >
                See how it works
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 text-duo-hare pt-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-duo-macaw" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Private by default</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-duo-feather" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Evidence-backed answers</span>
              </div>
            </div>
          </div>

          {/* Right Side: Mini Demo Card */}
          <div className="flex-1 w-full max-w-2xl relative">
            <div className="relative rounded-[3rem] border-4 border-duo-swan bg-background p-6 md:p-8 shadow-[0_12px_0_var(--duo-swan)] space-y-6">
              
              {/* Step 1: Capture */}
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-duo-wolf">
                    <Mic className="w-3.5 h-3.5 text-duo-macaw" />
                    Step 1: Capture
                  </div>
                  <div className="text-[10px] font-black text-duo-wolf/40 italic">Voice Note • May 12</div>
                </div>
                <div className="p-4 bg-duo-polar rounded-2xl border-2 border-duo-swan">
                  <p className="font-bold text-duo-eel italic leading-tight">
                    "Met Sarah about Q4 hiring. Senior engineers first. Follow up by Tuesday."
                  </p>
                </div>
              </div>

              {/* Step 2: Extraction (Animated Bridge) */}
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-duo-swan to-duo-macaw" />
                <div className="px-4 py-1 rounded-full border-2 border-duo-macaw text-duo-macaw text-[9px] font-black uppercase tracking-widest bg-duo-macaw/5 flex items-center gap-1.5">
                  <Brain className="w-3 h-3" />
                  Extracting Entities
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-duo-macaw via-duo-swan to-transparent" />
              </div>

              {/* Step 3: Knowledge Graph Fragment */}
              <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
                <div className="px-4 py-3 rounded-2xl bg-duo-macaw/5 border-2 border-duo-macaw/20 space-y-1">
                  <div className="text-[8px] font-black uppercase text-duo-macaw tracking-tighter">Person</div>
                  <div className="font-black text-sm text-duo-eel">Sarah Chen</div>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-duo-macaw/5 border-2 border-duo-macaw/20 space-y-1">
                  <div className="text-[8px] font-black uppercase text-duo-macaw tracking-tighter">Priority</div>
                  <div className="font-black text-sm text-duo-eel">Senior Engineers</div>
                </div>
              </div>

              {/* Step 4: The Ask & Answer */}
              <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-1000">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-duo-wolf">
                  <Search className="w-3.5 h-3.5 text-duo-feather" />
                  Step 2: Ask
                </div>
                <div className="flex items-start gap-3 flex-row-reverse">
                   <div className="w-8 h-8 rounded-lg bg-duo-swan/20 border-2 border-duo-swan flex items-center justify-center shrink-0">
                     <User className="w-4 h-4 text-duo-wolf" />
                   </div>
                   <div className="p-4 bg-white border-4 border-duo-swan rounded-2xl rounded-tr-none shadow-[0_4px_0_var(--duo-swan)]">
                     <p className="text-sm font-black text-duo-eel italic">"What did Sarah suggest?"</p>
                   </div>
                </div>

                <div className="flex items-start gap-3">
                   <div className="w-8 h-8 rounded-lg bg-duo-feather border-2 border-duo-feather-shadow flex items-center justify-center shadow-[0_2px_0_var(--duo-feather-shadow)] shrink-0">
                     <Sparkles className="w-4 h-4 text-white" />
                   </div>
                   <div className="space-y-2">
                     <div className="p-5 bg-duo-polar border-4 border-duo-swan rounded-2xl rounded-tl-none shadow-[0_6px_0_var(--duo-swan)]">
                       <p className="text-sm font-bold text-duo-eel leading-relaxed">
                         Sarah suggested prioritizing <span className="text-duo-feather underline decoration-2 underline-offset-4">senior engineers</span> first for the Q4 hiring plan.
                       </p>
                     </div>
                     <div className="flex items-center gap-2 px-1">
                        <span className="text-[9px] font-black uppercase text-duo-hare tracking-widest">Source:</span>
                        <div className="px-2 py-0.5 rounded-md bg-duo-macaw/10 border border-duo-macaw/20 text-[9px] font-black text-duo-macaw uppercase">Voice Note • May 12</div>
                     </div>
                   </div>
                </div>
              </div>

            </div>

            {/* Floating Trust Indicator */}
            <div className="absolute -bottom-6 -right-6 bg-duo-macaw text-white px-5 py-3 rounded-2xl shadow-[0_6px_0_var(--duo-macaw-shadow)] border-4 border-white flex items-center gap-3 animate-float z-20">
               <Shield className="w-5 h-5" />
               <span className="text-xs font-black uppercase tracking-widest">Encrypted. Private. Yours.</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}




