"use client";

import { Brain, Search, Sparkles, MessagesSquare, Mic, Lock, GitBranch, TrendingUp, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Memory Engine",
    description: "Debo turns entries into durable memories, surfacing what matters across time.",
    color: "text-duo-green",
    borderColor: "border-duo-feather",
  },
  {
    icon: Search,
    title: "Ask Your Life",
    description: "Ask natural questions about your past and get evidence-backed answers.",
    color: "text-duo-blue",
    borderColor: "border-duo-macaw",
  },
  {
    icon: Sparkles,
    title: "Pattern Detection",
    description: "Automatically surface habits and recurring signals from your entries.",
    color: "text-duo-purple",
    borderColor: "border-duo-beetle",
  },
  {
    icon: MessagesSquare,
    title: "Life Timeline",
    description: "See your months and years at a glance with curated summaries.",
    color: "text-duo-orange",
    borderColor: "border-duo-fox",
  },
  {
    icon: GitBranch,
    title: "Memory Graph",
    description: "Explore connections between people, topics, and emotions over time.",
    color: "text-duo-blue",
    borderColor: "border-duo-humpback",
  },
  {
    icon: TrendingUp,
    title: "Proactive Insights",
    description: "Receive actionable nudges and advice based on your history.",
    color: "text-duo-red",
    borderColor: "border-duo-cardinal",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-muted border-t-2 border-duo-swan">
      <div className="container mx-auto max-w-5xl px-6 relative">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-duo-eel">
            Everything you need to <span className="text-duo-green">understand your life.</span>
          </h2>
          <p className="mt-4 text-lg text-duo-wolf font-bold">
            Powerful features that work together to turn your journal into genuine self-knowledge.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="duo-card p-8 flex flex-col items-center text-center group"
              >
                <div className={`p-4 rounded-2xl bg-muted border-2 ${feature.borderColor} ${feature.color} mb-6 transition-transform group-hover:scale-110`}>
                  <Icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-heading font-black mb-3 text-duo-eel">{feature.title}</h3>
                <p className="text-duo-wolf font-bold leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
