"use client";

import { MicOff, SearchX, BrainCircuit } from "lucide-react";

const problems = [
  {
    icon: MicOff,
    title: "Voice notes disappear",
    description: "You record a thought but never listen back. It becomes just another file in a folder you'll never open.",
    color: "text-duo-cardinal",
    borderColor: "border-duo-cardinal",
  },
  {
    icon: BrainCircuit,
    title: "Journals don’t connect",
    description: "Your diary is a graveyard of insights. You can't see how your mood last year connects to your work today.",
    color: "text-duo-fox",
    borderColor: "border-duo-fox",
  },
  {
    icon: SearchX,
    title: "AI tools forget you",
    description: "Generic AI doesn't know your context. It doesn't remember your promises, your people, or your personal history.",
    color: "text-duo-macaw",
    borderColor: "border-duo-macaw",
  },
];

export function Problem() {
  return (
    <section className="py-24 bg-duo-polar dark:bg-slate-900/50 border-t-2 border-duo-swan">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="mb-16 text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-heading font-black text-duo-eel dark:text-white">
            You already capture your life. <br />
            <span className="text-duo-cardinal">You just can’t search it.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-duo-wolf dark:text-slate-400 font-bold leading-relaxed">
            Your memories are scattered across voice notes, journals, screenshots, and random apps. Search doesn’t understand the meaning. Journals don’t remind you.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem) => {
            const Icon = problem.icon;
            return (
              <div 
                key={problem.title}
                className="duo-card p-8 flex flex-col items-center text-center shadow-[0_8px_0_var(--duo-swan)]"
              >
                <div className={`w-16 h-16 rounded-2xl bg-background border-2 ${problem.borderColor} ${problem.color} flex items-center justify-center mb-6`}>
                  <Icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-black mb-3 text-duo-eel dark:text-white uppercase tracking-wider">{problem.title}</h3>
                <p className="text-duo-wolf dark:text-slate-400 font-bold leading-relaxed">
                  {problem.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}



