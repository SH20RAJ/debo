"use client";

import { Brain, FileText, Tags, X, AlertCircle } from "lucide-react";

const problems = [
  {
    icon: Brain,
    title: "You forget patterns",
    description: "Your life is full of recurring themes, but human memory is scattered. You lose track of the big picture.",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    icon: FileText,
    title: "Notes are static",
    description: "Traditional journals just sit there. They don't talk back, they don't connect the dots, they just store text.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Tags,
    title: "No real intelligence",
    description: "You spend hours organizing tags and folders instead of actually understanding your own life and habits.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

export function Problem() {
  return (
    <section className="relative py-24 bg-muted/30 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-destructive/5 to-transparent" />
      
      <div className="container mx-auto max-w-6xl px-6 relative">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive border border-destructive/20 mb-6">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">The Problem</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            The old way is <span className="text-destructive">broken.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Traditional journaling leaves your memories trapped in static text, disconnected and forgotten.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <div 
                key={problem.title}
                className="group relative p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:border-destructive/30 hover:shadow-lg hover:shadow-destructive/5 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-destructive/5 to-transparent rounded-tr-2xl rounded-bl-full" />
                
                <div className={`inline-flex p-3 rounded-xl ${problem.bgColor} ${problem.color} mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3">{problem.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>
                
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground/60">
                  <X className="w-4 h-4 text-destructive/60" />
                  <span>No insight, no connection</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
