"use client";

import { Brain, Search, Sparkles, MessagesSquare, Mic, Lock, GitBranch, TrendingUp, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Memory Engine",
    description: "Debo turns entries into durable memories, surfacing what matters across time.",
    example: '"I prefer deep work on Tuesdays" saved as a preference.',
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Search,
    title: "Ask Your Life",
    description: "Ask natural questions about your past and get evidence-backed answers.",
    example: '"When was I happiest this year?" → timeline + citations.',
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    icon: Sparkles,
    title: "Pattern Detection",
    description: "Automatically surface habits and recurring signals from your entries.",
    example: "Recurring stress spikes before deadlines detected.",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    icon: MessagesSquare,
    title: "Life Timeline",
    description: "See your months and years at a glance with curated summaries.",
    example: "Monthly rollups and major event highlights.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: GitBranch,
    title: "Memory Graph",
    description: "Explore connections between people, topics, and emotions over time.",
    example: "Who appears most in your progress stories.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    icon: TrendingUp,
    title: "Proactive Insights",
    description: "Receive actionable nudges and advice based on your history.",
    example: '"You do best work mornings; schedule focus blocks then."',
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    icon: Mic,
    title: "Jarvis Voice Mode",
    description: "Talk to your life naturally with sub-second voice interactions.",
    example: '"Hey Debo, what was my main win yesterday?"',
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Your data is yours. Encrypted at rest and in transit, with full ownership.",
    example: "Full data export and deletion at any time.",
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
  },
  {
    icon: Zap,
    title: "Instant Sync",
    description: "Your memories sync in real-time across all your devices seamlessly.",
    example: "Start on mobile, continue on desktop.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary-muted),_transparent_60%)]" />
      
      <div className="container mx-auto max-w-6xl px-6 relative">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Everything you need to <span className="text-primary">understand your life.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features that work together to turn your journal into genuine self-knowledge.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl border border-border/50 bg-background/80 backdrop-blur-sm hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} ${feature.color} mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {feature.description}
                </p>
                <p className="text-xs text-muted-foreground/70 italic bg-muted/50 rounded-lg px-3 py-2">
                  {feature.example}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
