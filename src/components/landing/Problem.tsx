"use client";

import { MicOff, SearchX, BrainCircuit, CloudOff, Ghost, Clock9 } from "lucide-react";

const problems = [
  {
    icon: Ghost,
    title: "Memories become ghosts",
    description: "You record a voice note or write a journal entry, but you never look back. Your life context is locked in dead files.",
  },
  {
    icon: Clock9,
    title: "Promises fall through",
    description: "You tell someone you'll follow up on a specific date. Without a personal memory engine, that promise is lost in the noise.",
  },
  {
    icon: CloudOff,
    title: "The context tax",
    description: "Scattered context means you spend hours digging for that one decision from a meeting three months ago.",
  },
];

export function Problem() {
  return (
    <section className="py-24 bg-duo-polar border-t-2 border-duo-swan">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="mb-16 text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-heading font-black text-duo-eel leading-tight">
            Your memories are <br />
            <span className="text-duo-cardinal italic">disappearing.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-duo-wolf font-bold leading-relaxed">
            Scattered thoughts across voice notes, journals, and random apps never connect. You forget what you promised, what you did, and who you were.
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
                <div className="w-16 h-16 rounded-2xl bg-background border-2 border-duo-swan text-duo-macaw flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-black mb-3 text-duo-eel uppercase tracking-wider">{problem.title}</h3>
                <p className="text-duo-wolf font-bold leading-relaxed text-sm">
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





