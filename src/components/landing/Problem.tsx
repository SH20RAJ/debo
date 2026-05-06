"use client";

import { Brain, FileText, Tags } from "lucide-react";

const problems = [
  {
    icon: Brain,
    title: "You forget patterns",
    description: "Your life is full of recurring themes, but human memory is scattered. You lose track of the big picture.",
    color: "text-duo-red",
    borderColor: "border-duo-cardinal",
  },
  {
    icon: FileText,
    title: "Notes are static",
    description: "Traditional journals just sit there. They don't talk back, they don't connect the dots, they just store text.",
    color: "text-duo-orange",
    borderColor: "border-duo-fox",
  },
  {
    icon: Tags,
    title: "No real intelligence",
    description: "You spend hours organizing tags and folders instead of actually understanding your own life and habits.",
    color: "text-duo-blue",
    borderColor: "border-duo-macaw",
  },
];

export function Problem() {
  return (
    <section className="py-20 bg-background border-t-2 border-duo-swan">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-duo-eel">
            The old way is <span className="text-duo-red">broken.</span>
          </h2>
          <p className="mt-4 text-lg text-duo-wolf font-bold">
            Traditional journaling leaves your memories trapped in static text, disconnected and forgotten.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem) => {
            const Icon = problem.icon;
            return (
              <div 
                key={problem.title}
                className={`p-8 rounded-2xl border-2 border-duo-swan bg-background hover:bg-muted transition-colors text-center flex flex-col items-center`}
              >
                <div className={`p-4 rounded-2xl bg-background border-2 ${problem.borderColor} ${problem.color} mb-6`}>
                  <Icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-heading font-black mb-3 text-duo-eel">{problem.title}</h3>
                <p className="text-duo-wolf font-bold leading-relaxed">
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

