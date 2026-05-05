"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield, Check, Heart } from "lucide-react";

const benefits = [
  "No credit card required",
  "30-second signup",
  "Full data ownership",
];

export function CTA() {
  return (
    <section className="relative overflow-hidden py-32 bg-white border-t-2 border-duo-swan">
      <div className="container relative z-10 mx-auto max-w-5xl px-6 flex flex-col items-center text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black text-duo-eel mb-12">
          Start understanding <br className="hidden sm:block" />
          <span className="text-duo-blue">your life today.</span>
        </h2>
        
        <div className="flex flex-col w-full max-w-sm space-y-6 mb-16">
          <Button asChild variant="duolingo" size="lg" className="w-full">
            <Link href="/join">Get Started</Link>
          </Button>
          
          <div className="flex flex-col gap-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center justify-center gap-2 text-base font-bold text-duo-wolf">
                <Check className="w-5 h-5 text-duo-green" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-8 items-center border-t-2 border-duo-swan pt-12 w-full max-w-3xl">
          <Link 
            href="/privacy" 
            className="flex items-center gap-2 text-sm font-black text-duo-wolf hover:text-duo-eel transition-colors"
          >
            <Shield className="w-4 h-4 text-duo-blue" />
            <span>PRIVACY POLICY</span>
          </Link>
          
          <Link 
            href="https://github.com/SH20RAJ/debo/issues" 
            className="flex items-center gap-2 text-sm font-black text-duo-wolf hover:text-duo-eel transition-colors"
          >
            <Heart className="w-4 h-4 text-duo-red" />
            <span>HELP US BUILD</span>
          </Link>
          
          <Link 
            href="/terms" 
            className="text-sm font-black text-duo-wolf hover:text-duo-eel transition-colors"
          >
            <span>TERMS OF SERVICE</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

