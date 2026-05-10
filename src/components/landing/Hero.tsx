"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

type HeroProps = {
  isSignedIn?: boolean;
};

export function Hero({ isSignedIn = false }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center bg-[#131f24] px-6 py-20 text-center overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-8 flex flex-col items-center mt-10">
        
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#58cc02]/20 text-[#58cc02] font-extrabold uppercase tracking-wide text-sm border-2 border-[#58cc02]/30">
          <Sparkles className="h-4 w-4" />
          <span>Your Smart Journal</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1]">
          Remember <span className="text-[#58cc02]">everything</span>. <br />
          Understand <span className="text-cyan-400">yourself</span>.
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed">
          Debo learns from your history to help you connect the dots. A second brain that actually feels like you.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-5 pt-6 w-full sm:w-auto">
          {isSignedIn ? (
            <Link 
              href="/dashboard" 
              className="group flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-5 bg-[#58cc02] hover:bg-[#46a302] text-white font-extrabold text-[1.1rem] rounded-2xl border-b-[5px] border-[#46a302] active:border-b-0 active:mt-[5px] transition-all"
            >
              Open Dashboard <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <>
              <Link 
                href="/join" 
                className="w-full sm:w-auto px-12 py-5 bg-[#58cc02] hover:bg-[#46a302] text-white font-extrabold text-[1.1rem] rounded-2xl border-b-[5px] border-[#46a302] active:border-b-0 active:mt-[5px] transition-all"
              >
                GET STARTED
              </Link>
              <Link 
                href="#features" 
                className="w-full sm:w-auto px-12 py-5 bg-[#1f2937] hover:bg-[#374151] text-white font-extrabold text-[1.1rem] rounded-2xl border-2 border-[#374151] border-b-[5px] active:border-b-2 active:mt-[3px] transition-all"
              >
                LEARN MORE
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}