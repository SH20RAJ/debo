"use client";

import Link from "next/link";
import { ArrowRight, Shield, CheckCircle2, User, Calendar, Sparkles, Mic, Brain } from "lucide-react";

type HeroProps = {
  isSignedIn?: boolean;
};

export function Hero({ isSignedIn = false }: HeroProps) {
  return (
    <section className="relative bg-background px-6 pt-20 pb-32 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-duo-macaw/5 to-transparent pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-32">
          
          {/* Left Side: Content */}
          <div className="flex-1 space-y-12 text-center lg:text-left">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-duo-macaw bg-duo-macaw/10 text-duo-macaw font-black uppercase tracking-[0.2em] text-[10px]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Next-Gen Personal Memory</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-heading font-black text-duo-eel tracking-tight leading-[0.95]">
                Never forget <br />
                <span className="text-duo-feather">another thought.</span>
              </h1>
              <p className="text-xl md:text-2xl text-duo-wolf max-w-2xl mx-auto lg:mx-0 font-bold leading-relaxed">
                Debo turns your voice notes, journals, and calendar context into a searchable record of your life.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
              <Link
                href={isSignedIn ? "/dashboard" : "/join"}
                className="duo-btn duo-btn--primary group flex items-center justify-center gap-3 w-full sm:w-auto px-12 py-6 text-xl shadow-[0_8px_0_var(--duo-feather-shadow)]"
              >
                Start Remembering
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Link>
              <div className="flex -space-x-3 items-center">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-duo-swan flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                  </div>
                ))}
                <div className="pl-6 text-xs font-black text-duo-wolf uppercase tracking-widest">
                  Joined by 1,000+ early adopters
                </div>
              </div>
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

          {/* Right Side: Enhanced Demo Visual */}
          <div className="flex-1 w-full max-w-2xl relative">
            {/* Decorative background elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-duo-bee/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-duo-macaw/10 rounded-full blur-2xl animate-pulse" />

            <div className="relative rounded-[3.5rem] border-4 border-duo-swan bg-background p-8 md:p-12 shadow-[0_16px_0_var(--duo-swan)]">
              <div className="space-y-12">
                {/* Voice Input Visualization */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[12px] font-black uppercase tracking-widest text-duo-wolf">
                      <Mic className="w-4 h-4 text-duo-macaw" />
                      Capture: Voice Note
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-duo-macaw bg-duo-macaw/10 px-3 py-1 rounded-full border-2 border-duo-macaw">Live</div>
                  </div>
                  <div className="flex gap-1.5 h-12 items-center px-4 bg-duo-polar rounded-2xl border-2 border-duo-swan">
                     {[0.4, 0.7, 0.5, 0.9, 0.3, 0.8, 0.6, 0.4, 0.7, 0.5].map((h, i) => (
                       <div 
                         key={i} 
                         className="flex-1 bg-duo-macaw rounded-full animate-bounce-subtle" 
                         style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }} 
                       />
                     ))}
                  </div>
                  <p className="italic font-bold text-lg text-duo-eel leading-relaxed">
                    "Met with Sarah today. We discussed the Q4 hiring plan and she suggested we focus on senior engineers first."
                  </p>
                </div>

                {/* AI Logic Bridge */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-px h-12 bg-gradient-to-b from-duo-swan to-duo-macaw" />
                  <div className="px-6 py-2 rounded-full bg-duo-macaw text-white text-[12px] font-black uppercase tracking-widest shadow-[0_4px_0_var(--duo-macaw-shadow)] flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Memory Injected
                  </div>
                  <div className="w-px h-12 bg-gradient-to-b from-duo-macaw to-duo-swan" />
                </div>

                {/* Extracted Memory Cards */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 rounded-[2rem] bg-background border-2 border-duo-swan shadow-[0_6px_0_var(--duo-swan)] space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-duo-wolf">
                      <User className="w-3.5 h-3.5 text-duo-macaw" /> Entity
                    </div>
                    <div className="font-black text-xl text-duo-eel">Sarah Chen</div>
                    <div className="text-[10px] text-duo-wolf font-bold">Engineering Lead</div>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-background border-2 border-duo-swan shadow-[0_6px_0_var(--duo-swan)] space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-duo-wolf">
                      <Calendar className="w-3.5 h-3.5 text-duo-macaw" /> Focus
                    </div>
                    <div className="font-black text-xl text-duo-eel">Q4 Hiring</div>
                    <div className="text-[10px] text-duo-wolf font-bold">Priority: High</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Achievement Badge */}
            <div className="absolute -bottom-6 -right-6 bg-duo-feather text-white px-6 py-4 rounded-[2rem] shadow-[0_8px_0_var(--duo-feather-shadow)] border-4 border-white dark:border-slate-800 flex items-center gap-4 animate-float z-20">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Timeline Updated</div>
                <div className="text-sm font-black">Memory Secured</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}



