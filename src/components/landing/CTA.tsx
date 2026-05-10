"use client";

import Link from "next/link";
import { Shield, ArrowRight, Zap, Users, Github } from "lucide-react";

const proofItems = [
  { label: "Built in public", icon: Users, color: "text-duo-macaw" },
  { label: "Open source", icon: Github, color: "text-duo-orange" },
  { label: "Private by design", icon: Shield, color: "text-duo-feather" },
  { label: "Early access open", icon: Zap, color: "text-duo-bee" },
];

export function CTA() {
  return (
    <section className="relative overflow-hidden py-32 bg-background border-t-2 border-duo-swan">
      {/* Background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-duo-swan/50 to-transparent" />
      
      <div className="container relative z-10 mx-auto max-w-4xl px-6 flex flex-col items-center text-center">
        {/* Above-the-fold proof style metrics */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-16">
          {proofItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="text-xs font-black uppercase tracking-widest text-duo-wolf">{item.label}</span>
            </div>
          ))}
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black text-duo-eel mb-8 leading-tight">
          Start building your <br />
          <span className="text-duo-macaw">life memory today.</span>
        </h2>

        <p className="text-xl md:text-2xl text-duo-wolf font-bold mb-12 max-w-2xl leading-relaxed">
          Record one thought. Ask your first question. <br className="hidden md:block" />
          See what Debo remembers.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-lg mb-16">
          <Link 
            href="/join" 
            className="duo-btn duo-btn--primary flex-1 flex items-center justify-center gap-3 w-full h-16 text-xl shadow-[0_6px_0_var(--duo-feather-shadow)]"
          >
            Start free <ArrowRight className="h-6 w-6" />
          </Link>
          <Link 
            href="https://github.com/SH20RAJ/debo" 
            className="duo-btn duo-btn--secondary flex-1 flex items-center justify-center gap-3 w-full h-16 text-xl shadow-[0_6px_0_var(--duo-swan)]"
          >
            <Github className="h-6 w-6" /> View GitHub
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12 items-center border-t-2 border-duo-swan/30 pt-12 w-full max-w-2xl">
          <Link
            href="/privacy"
            className="text-xs font-black text-duo-hare hover:text-duo-eel transition-colors uppercase tracking-[0.2em]"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-xs font-black text-duo-hare hover:text-duo-eel transition-colors uppercase tracking-[0.2em]"
          >
            Terms of Service
          </Link>
          <Link
            href="https://discord.gg/debo"
            className="text-xs font-black text-duo-hare hover:text-duo-eel transition-colors uppercase tracking-[0.2em]"
          >
            Discord Community
          </Link>
        </div>
      </div>
    </section>
  );
}