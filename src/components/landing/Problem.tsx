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
    <section className="py-32 bg-muted/30 border-y border-border/10">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="mb-20 text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-foreground leading-[1.1]">
            Your memories are <br />
            <span className="text-primary/60 italic">disappearing.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium leading-relaxed">
            Scattered thoughts across random apps never connect. You forget what you promised, what you did, and who you were.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem) => {
            const Icon = problem.icon;
            return (
              <div 
                key={problem.title}
                className="minimal-card flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-background border border-border text-primary/60 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-lg font-semibold mb-3 text-foreground tracking-tight">{problem.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed text-sm">
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





