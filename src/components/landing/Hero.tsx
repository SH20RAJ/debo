"use client";

import Link from "next/link";
import { ArrowRight, Play, Shield, CheckCircle2, User, Calendar, Tag, Sparkles } from "lucide-react";

type HeroProps = {
  isSignedIn?: boolean;
};

export function Hero({ isSignedIn = false }: HeroProps) {
  return (
    <section className="relative bg-background px-6 pt-16 pb-24 overflow-hidden">
      <div className="container mx-auto max-w-7xl relative">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Left Side: Content */}
          <div className="flex-1 space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-duo-macaw bg-duo-macaw/10 text-duo-macaw font-black uppercase tracking-wider text-xs">
              <Sparkles className="h-4 w-4" />
              <span>Early Access Open</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-heading font-black text-duo-eel tracking-tight leading-[1.1]">
                Your private AI memory <br />
                <span className="text-duo-feather">for everything you forget</span>
              </h1>
              <p className="text-xl text-duo-wolf max-w-2xl mx-auto lg:mx-0 font-bold leading-relaxed">
                Debo turns voice notes, journals, diary scans, AI chats, and calendar context into searchable memories and evidence-backed answers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <Link
                href={isSignedIn ? "/dashboard" : "/join"}
                className="duo-btn duo-btn--primary group flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-5 text-lg shadow-[0_6px_0_var(--duo-feather-shadow)]"
              >
                Start remembering for free
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="duo-btn duo-btn--secondary flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-5 text-lg shadow-[0_6px_0_var(--duo-swan)]">
                Try example questions
              </button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 text-duo-hare pt-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-duo-macaw" />
                <span className="text-sm font-black uppercase tracking-widest">Private by design</span>
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-duo-swan" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-black uppercase tracking-widest">Export anytime</span>
              </div>
            </div>
          </div>

          {/* Right Side: Demo Visual */}
          <div className="flex-1 w-full max-w-2xl">
            <div className="relative rounded-[3rem] border-4 border-duo-swan bg-background p-6 md:p-10 shadow-[0_12px_0_var(--duo-swan)] overflow-hidden">
              <div className="space-y-10">
                {/* User Input Mockup */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-duo-wolf">
                    <span className="w-2.5 h-2.5 rounded-full bg-duo-macaw shadow-[0_2px_0_var(--duo-macaw-shadow)]" />
                    Input: Voice Note
                  </div>
                  <div className="p-6 rounded-[2rem] bg-duo-polar border-2 border-duo-swan shadow-inner italic font-bold text-duo-eel">
                    "Remind me I promised Aarav the product review deck by Friday."
                  </div>
                </div>

                {/* Debo Processing Line */}
                <div className="flex items-center gap-4">
                  <div className="h-1 flex-grow bg-duo-swan rounded-full" />
                  <div className="px-4 py-1.5 rounded-full bg-duo-macaw text-white text-[11px] font-black uppercase tracking-widest shadow-[0_4px_0_var(--duo-macaw-shadow)]">
                    Debo Extraction
                  </div>
                  <div className="h-1 flex-grow bg-duo-swan rounded-full" />
                </div>

                {/* Debo Output Mockup */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="p-5 rounded-2xl bg-background border-2 border-duo-swan shadow-[0_4px_0_var(--duo-swan)] space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-duo-wolf">
                      <User className="w-3 h-3 text-duo-macaw" /> Person
                    </div>
                    <div className="font-black text-duo-eel">Aarav</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-background border-2 border-duo-swan shadow-[0_4px_0_var(--duo-swan)] space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-duo-wolf">
                      <Calendar className="w-3 h-3 text-duo-macaw" /> Due Date
                    </div>
                    <div className="font-black text-duo-eel">Friday, May 15</div>
                  </div>
                  <div className="col-span-2 p-6 rounded-[2rem] bg-duo-feather border-2 border-duo-feather-shadow shadow-[0_6px_0_var(--duo-feather-shadow)] space-y-2 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter opacity-90">
                        <CheckCircle2 className="w-4 h-4" /> Suggested Action
                      </div>
                      <div className="text-[11px] font-black uppercase bg-white/20 px-3 py-1 rounded-full border border-white/30 text-white">Drafted</div>
                    </div>
                    <div className="text-lg font-black leading-tight">Create calendar reminder: "Review deck for Aarav"</div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute bottom-6 right-6 bg-duo-feather text-white px-5 py-3 rounded-2xl shadow-[0_4px_0_var(--duo-feather-shadow)] border-2 border-duo-feather-shadow flex items-center gap-3 animate-float">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-black uppercase tracking-widest">Saved</span>
              </div>
            </div>
          </div>


        </div>
      </div>
    </section>
  );
}



