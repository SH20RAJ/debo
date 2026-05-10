"use client";

import { MessageSquare, Calendar, BarChart3, Search, User, ClipboardList } from "lucide-react";

const useCases = [
  {
    question: "What did I say I’d do this week?",
    answer: "You promised to send the product review deck to Aarav by Friday and follow up with the design team on Tuesday.",
    sources: "Voice note from May 10, Journal entry from May 8",
    icon: ClipboardList,
    color: "text-duo-macaw",
    borderColor: "border-duo-macaw",
  },
  {
    question: "When do I feel most productive?",
    answer: "You usually get deep work done in the mornings following a workout session.",
    sources: "Journal entries from Mar 3, Mar 18, Apr 7 + calendar blocks",
    icon: BarChart3,
    color: "text-duo-feather",
    borderColor: "border-duo-feather",
  },
  {
    question: "Summarize my last month.",
    answer: "Your focus was on the Debo launch. Key milestones: finalized the memory engine, started early access, and improved voice latency.",
    sources: "Daily journals (30 entries), 12 voice notes, 4 calendar events",
    icon: Search,
    color: "text-duo-beetle",
    borderColor: "border-duo-beetle",
  },
  {
    question: "What patterns repeat in my work?",
    answer: "You tend to feel overwhelmed on Wednesdays when you have more than 4 back-to-back meetings.",
    sources: "Mood tracking in journals, Calendar context from Apr-May",
    icon: User,
    color: "text-duo-fox",
    borderColor: "border-duo-fox",
  },
  {
    question: "What did I discuss with Sarah?",
    answer: "Last Tuesday, you discussed the Q3 roadmap and the need for better export controls.",
    sources: "AI chat export from May 5, Voice note from May 4",
    icon: MessageSquare,
    color: "text-duo-macaw",
    borderColor: "border-duo-macaw",
  },
  {
    question: "Create reminders from this voice note.",
    answer: "Drafted: 'Buy milk' (Today), 'Call mom' (Sunday), 'Submit taxes' (Apr 15).",
    sources: "Voice note recorded today at 2:30 PM",
    icon: Calendar,
    color: "text-duo-cardinal",
    borderColor: "border-duo-cardinal",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="py-24 bg-background dark:bg-slate-950">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-heading font-black text-duo-eel dark:text-white">
            What you can <span className="text-duo-macaw">ask Debo</span>
          </h2>
          <p className="text-xl text-duo-wolf dark:text-slate-400 font-bold max-w-2xl mx-auto">
            Debo doesn't just store data—it understands it. Ask questions about your life and get evidence-backed answers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div 
              key={index}
              className="duo-card p-8 flex flex-col shadow-[0_8px_0_var(--duo-swan)]"
            >
              <div className={`w-14 h-14 rounded-2xl bg-background border-2 ${useCase.borderColor} ${useCase.color} flex items-center justify-center mb-6`}>
                <useCase.icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-lg font-black text-duo-eel dark:text-white mb-6 leading-tight uppercase tracking-wider">
                "{useCase.question}"
              </h3>
              
              <div className="flex-grow space-y-6">
                <div className="p-6 rounded-[2rem] bg-duo-polar dark:bg-slate-800/50 border-2 border-duo-swan shadow-inner">
                  <p className="text-sm text-duo-eel dark:text-slate-300 font-bold italic">
                    {useCase.answer}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-duo-hare">
                    Sources:
                  </span>
                  <span className="px-3 py-1 rounded-full bg-duo-swan text-duo-wolf text-[11px] font-black uppercase tracking-wider">
                    {useCase.sources}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

