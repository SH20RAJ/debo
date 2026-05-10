"use client";

import Link from "next/link";
import { Shield, ArrowRight, Zap, Users, Code } from "lucide-react";

const proofItems = [
  { label: "Built in public", icon: Users, color: "text-duo-macaw" },
  { label: "Open source", icon: Code, color: "text-duo-orange" },
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
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            View GitHub
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