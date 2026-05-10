"use client";

import { Sparkles, User, Search, MessageSquare, Calendar, BarChart3, ClipboardList } from "lucide-react";

const useCases = [
  {
    question: "What did I say I’d do this week?",
    answer: "You promised to send the product review deck to Aarav by Friday and follow up with the design team on Tuesday.",
    icon: ClipboardList,
    sources: "Voice note + Journal",
  },
  {
    question: "When do I feel most productive?",
    answer: "You usually get deep work done in the mornings following a workout session.",
    icon: BarChart3,
    sources: "Journal + Calendar",
  },
  {
    question: "What did I discuss with Sarah?",
    answer: "Last Tuesday, you discussed the Q3 roadmap and the need for better export controls.",
    icon: MessageSquare,
    sources: "AI Chat + Voice Note",
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
            Ask your <span className="text-duo-macaw">past self.</span>
          </h2>
          <p className="text-xl text-duo-wolf font-bold max-w-2xl mx-auto leading-relaxed">
            Debo extracts the facts, so you don't have to dig.
          </p>
        </div>

        <div className="space-y-16">
          {useCases.map((useCase, index) => (
            <div key={index} className="flex flex-col gap-6 max-w-2xl mx-auto">
              {/* User Question */}
              <div className="flex items-start gap-4 self-end flex-row-reverse">
                <div className="w-12 h-12 rounded-2xl bg-duo-swan/20 border-2 border-duo-swan flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-duo-wolf" />
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] rounded-tr-none border-4 border-duo-swan shadow-[0_6px_0_var(--duo-swan)]">
                  <p className="text-lg font-black text-duo-eel dark:text-white uppercase tracking-tight italic">
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
                  <div className="bg-duo-polar dark:bg-slate-900 p-8 rounded-[2rem] rounded-tl-none border-4 border-duo-swan shadow-[0_8px_0_var(--duo-swan)]">
                    <p className="text-lg text-duo-eel dark:text-slate-200 font-bold leading-relaxed">
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
          <div className="p-1 rounded-full bg-duo-swan/30 inline-flex">
             <div className="px-6 py-2 rounded-full bg-background border-2 border-duo-swan text-[12px] font-black uppercase tracking-[0.2em] text-duo-wolf">
               + {useCaseData.length * 10} more capabilities
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const useCaseData = [
  "Mood tracking", "Daily summaries", "Action items", "Dream analysis", 
  "Conflict resolution", "Meeting prep", "Reminders", "Timeline",
  "Habit spotting", "Evidence extraction"
];


