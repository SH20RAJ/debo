"use client";

import { CloudOff, Ghost, Clock9 } from "lucide-react";

const problems = [
  {
    icon: Ghost,
    title: "Notes become dead ends",
    description: "You capture a thought once, then it disappears into an app you rarely search again.",
  },
  {
    icon: Clock9,
    title: "Follow-ups slip away",
    description: "Names, dates, decisions, and promises get buried before they become useful actions.",
  },
  {
    icon: CloudOff,
    title: "Context stays scattered",
    description: "Voice notes, journals, chats, and meetings do not connect, so every search starts from zero.",
  },
];

export function Problem() {
  return (
    <section className="py-28 bg-muted/30 border-y border-border/10 sm:py-32">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="mb-20 text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-foreground leading-[1.1]">
            Capturing is easy. <br />
            <span className="text-primary/60 italic">Remembering is broken.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium leading-relaxed">
            The problem is not taking more notes. It is turning what you already captured into context you can trust later.
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




