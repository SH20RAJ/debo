"use client";

import { Check, Minus, Brain, Search, Shield, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    name: "Store notes & journals",
    notes: true,
    chatbots: false,
    workspaces: true,
    debo: true,
  },
  {
    name: "Search by meaning (Semantic)",
    notes: false,
    chatbots: true,
    workspaces: false,
    debo: true,
  },
  {
    name: "Connect people, events & tasks",
    notes: false,
    chatbots: false,
    workspaces: "partial",
    debo: true,
  },
  {
    name: "Answers with cited sources",
    notes: false,
    chatbots: false,
    workspaces: false,
    debo: true,
  },
  {
    name: "Turn memories into approved actions",
    notes: false,
    chatbots: false,
    workspaces: "partial",
    debo: true,
  },
  {
    name: "Built for personal long-term memory",
    notes: true,
    chatbots: false,
    workspaces: false,
    debo: true,
  },
];

export function Differentiation() {
  return (
    <section id="comparison" className="py-24 bg-background border-t border-border/10 overflow-hidden">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-6xl font-heading font-black text-foreground leading-tight">
            How Debo <span className="text-primary italic">compares.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground font-bold leading-relaxed">
            Personal memory is different from general knowledge. Debo is built specifically to connect your life context over decades.
          </p>
        </div>

        <div className="overflow-x-auto pb-8">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-[1fr_repeat(4,160px)] gap-4 items-end mb-8 px-4">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-duo-wolf pb-4">Capability</div>
              <ColumnHeader label="Notes Apps" icon={Minus} />
              <ColumnHeader label="Chatbots" icon={Zap} />
              <ColumnHeader label="Workspaces" icon={Shield} />
              <ColumnHeader label="Debo" icon={Brain} isHighlight />
            </div>

            {/* Rows */}
            <div className="space-y-4">
              {features.map((feature, i) => (
                <div 
                  key={i} 
                  className="grid grid-cols-[1fr_repeat(4,160px)] gap-4 items-center p-4 rounded-2xl border-2 border-border/10 bg-card transition-all hover:border-primary/20 hover:shadow-xl"
                >
                  <div className="text-lg font-bold text-foreground">{feature.name}</div>
                  <div className="flex justify-center"><StatusIcon status={feature.notes} /></div>
                  <div className="flex justify-center"><StatusIcon status={feature.chatbots} /></div>
                  <div className="flex justify-center"><StatusIcon status={feature.workspaces} /></div>
                  <div className="flex justify-center bg-duo-macaw/5 rounded-xl py-3 -my-3 border-x-2 border-duo-macaw/10">
                    <StatusIcon status={feature.debo} isHighlight />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
           <div className="flex items-center gap-3 px-6 py-4 rounded-3xl bg-muted border-2 border-border max-w-md shadow-xl shadow-black/5">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center shrink-0">
               <Sparkles className="w-6 h-6 text-primary" />
             </div>
             <p className="text-sm font-bold text-muted-foreground">
               "Notes apps store data. Chatbots know the world. <span className="text-foreground">Debo knows you.</span>"
             </p>
           </div>
        </div>
      </div>
    </section>
  );
}

function ColumnHeader({ label, icon: Icon, isHighlight = false }: { label: string, icon: any, isHighlight?: boolean }) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-4 pb-4 px-2",
      isHighlight ? "text-duo-macaw scale-110" : "text-duo-wolf"
    )}>
      <div className={cn(
        "w-12 h-12 rounded-2xl border-2 flex items-center justify-center",
        isHighlight ? "bg-duo-macaw/10 border-duo-macaw shadow-[0_4px_0_var(--duo-macaw-shadow)]" : "bg-duo-polar border-duo-swan"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-sm font-black uppercase tracking-widest">{label}</div>
    </div>
  );
}

function StatusIcon({ status, isHighlight = false }: { status: boolean | string, isHighlight?: boolean }) {
  if (status === "partial") {
    return (
      <div className="flex flex-col items-center">
         <Minus className="w-5 h-5 text-duo-wolf" />
         <span className="text-[8px] font-black uppercase tracking-tighter text-duo-wolf/60 mt-1">Limited</span>
      </div>
    );
  }
  
  if (status) {
    return (
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-transform",
        isHighlight ? "bg-duo-macaw border-duo-macaw text-white scale-110" : "bg-duo-feather border-duo-feather text-white"
      )}>
        <Check className="w-5 h-5" />
      </div>
    );
  }
  
  return <div className="w-2 h-2 rounded-full bg-duo-swan" />;
}

