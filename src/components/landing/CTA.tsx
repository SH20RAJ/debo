"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield, Heart, ArrowRight, Check, Zap, Lock, Users } from "lucide-react";

const benefits = [
  "No credit card required",
  "30-second signup",
  "Full data ownership",
  "Open source & transparent",
];

const socialProof = [
  { number: "10K+", label: "Users" },
  { number: "1M+", label: "Memories stored" },
  { number: "99.9%", label: "Uptime" },
];

export function CTA() {
  return (
    <section className="relative overflow-hidden py-32 bg-gradient-to-b from-background to-duo-polar/20 border-t-2 border-duo-swan">
      {/* Background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-duo-swan/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-duo-feather/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-duo-green/5 rounded-full blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-4xl px-6 flex flex-col items-center text-center">
        {/* Social Proof */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {socialProof.map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-4xl font-black text-duo-eel">{item.number}</p>
              <p className="text-sm font-bold text-duo-swan uppercase tracking-wider">{item.label}</p>
            </div>
          ))}
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black text-duo-eel mb-6">
          Ready to remember <br className="hidden sm:block" />
          <span className="text-duo-feather">your life?</span>
        </h2>

        <p className="text-xl text-duo-wolf font-bold mb-12 max-w-xl">
          Join thousands using Debo to capture what matters and understand their patterns.
        </p>

        <div className="flex flex-col w-full max-w-sm space-y-6 mb-12">
          <Button asChild variant="duolingo" size="lg" className="h-14 rounded-2xl text-lg font-black shadow-xl">
            <Link href="/join" className="flex items-center gap-3">
              Get Started Free <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>

          <div className="flex flex-col gap-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center justify-center gap-2 text-base font-bold text-duo-wolf">
                <Check className="w-5 h-5 text-duo-green" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-12 items-center border-t-2 border-duo-swan/30 pt-10 w-full max-w-2xl">
          <Link
            href="/privacy"
            className="flex items-center gap-2 text-sm font-black text-duo-wolf hover:text-duo-eel transition-colors"
          >
            <Shield className="w-4 h-4 text-duo-blue" />
            <span>PRIVACY</span>
          </Link>

          <Link
            href="https://github.com/SH20RAJ/debo"
            className="flex items-center gap-2 text-sm font-black text-duo-wolf hover:text-duo-eel transition-colors"
          >
            <Zap className="w-4 h-4 text-duo-orange" />
            <span>OPEN SOURCE</span>
          </Link>

          <Link
            href="https://discord.gg/debo"
            className="flex items-center gap-2 text-sm font-black text-duo-wolf hover:text-duo-eel transition-colors"
          >
            <Users className="w-4 h-4 text-duo-purple" />
            <span>COMMUNITY</span>
          </Link>

          <Link
            href="/terms"
            className="text-sm font-black text-duo-wolf hover:text-duo-eel transition-colors"
          >
            <span>TERMS</span>
          </Link>
        </div>
      </div>
    </section>
  );
}