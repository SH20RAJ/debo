"use client";

import { Sparkles, User, Search, MessageSquare, Calendar, BarChart3, ClipboardList, PenTool, Lightbulb } from "lucide-react";

const useCases = [
  {
    persona: "Founders",
    question: "Why did we decide against the React migration in June?",
    answer: "Based on your voice note from June 12, the team decided to prioritize the mobile app performance audit instead, citing a lack of senior frontend capacity.",
    icon: Lightbulb,
    sources: "Voice note • June 12",
  },
  {
    persona: "Operators",
    question: "What were the next steps for Sarah?",
    answer: "You noted on Tuesday that Sarah needs the hiring plan by Friday and needs to follow up with the design team regarding the export UI.",
    icon: ClipboardList,
    sources: "Journal • Tuesday",
  },
  {
    persona: "Researchers",
    question: "What patterns are emerging in my user interviews?",
    answer: "Common themes include frustration with current export tools and a strong desire for more cited evidence in AI answers across all 12 recorded sessions.",
    icon: BarChart3,
    sources: "12 Voice Notes",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="py-32 bg-background relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-duo-macaw/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-duo-feather/5 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-4xl px-6 relative z-10">
        <div className="text-center mb-24 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-duo-macaw/10 border-2 border-duo-macaw text-duo-macaw font-black uppercase tracking-widest text-[10px]">
            <Search className="w-3 h-3" />
            <span>Search your life</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-heading font-black text-duo-eel leading-tight">
            Built for <span className="text-duo-macaw italic">heavy thinkers.</span>
          </h2>
          <p className="text-xl text-duo-wolf font-bold max-w-2xl mx-auto leading-relaxed">
            Founders, operators, and creators use Debo to bridge the gap between daily chaos and long-term clarity.
          </p>
        </div>

        <div className="space-y-16">
          {useCases.map((useCase, index) => (
            <div key={index} className="flex flex-col gap-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-duo-wolf/40">For {useCase.persona}</div>
                <div className="flex-1 h-px bg-duo-swan/20" />
              </div>
              
              {/* User Question */}
              <div className="flex items-start gap-4 self-end flex-row-reverse">
                <div className="w-12 h-12 rounded-2xl bg-duo-swan/20 border-2 border-duo-swan flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-duo-wolf" />
                </div>
                <div className="bg-white p-6 rounded-[2rem] rounded-tr-none border-4 border-duo-swan shadow-[0_6px_0_var(--duo-swan)]">
                  <p className="text-lg font-black text-duo-eel uppercase tracking-tight italic">
                    "{useCase.question}"
                  </p>
                </div>
              </div>

              {/* Debo Answer */}
              <div className="flex items-start gap-4 self-start">
                <div className="w-12 h-12 rounded-2xl bg-duo-macaw border-2 border-duo-macaw-shadow flex items-center justify-center shadow-[0_4px_0_var(--duo-macaw-shadow)] shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-3 max-w-md">
                  <div className="bg-duo-polar p-8 rounded-[2rem] rounded-tl-none border-4 border-duo-swan shadow-[0_8px_0_var(--duo-swan)]">
                    <p className="text-lg text-duo-eel font-bold leading-relaxed">
                      {useCase.answer}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-duo-hare">Source:</span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-duo-macaw">{useCase.sources}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-32 text-center">
           <Link href="/join" className="duo-btn duo-btn--primary px-10 py-4 text-lg shadow-[0_6px_0_var(--duo-feather-shadow)]">
              Start building your memory
           </Link>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";



