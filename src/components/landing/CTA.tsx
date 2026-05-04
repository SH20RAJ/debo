"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Check, Zap, Heart } from "lucide-react";

const benefits = [
  "No credit card required",
  "30-second signup",
  "Full data ownership",
];

export function CTA() {
  return (
    <section className="relative overflow-hidden py-32 bg-background border-t border-border/50">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-purple-500/30 to-blue-500/30 blur-[100px] rounded-full mix-blend-screen" />
      </div>
      
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />
      
      <div className="container relative z-10 mx-auto max-w-5xl px-6 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary border border-primary/20 mb-8">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium tracking-wide uppercase">Start Your Journey</span>
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          <span className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Start understanding
          </span>
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
            your life today.
          </span>
        </h2>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-8 font-light leading-relaxed">
          Join thousands who are journaling, reflecting, and growing with an AI that truly knows them.
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center justify-center mb-12">
          <Link href="/join" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              className="w-full sm:w-auto rounded-full text-lg px-10 h-14 group transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start free — Create my account
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-8 items-center border-t border-border/50 pt-10 w-full max-w-3xl">
          <Link 
            href="/privacy" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <Shield className="w-4 h-4 group-hover:text-primary transition-colors" />
            <span>How we protect your data</span>
          </Link>
          
          <div className="w-1 h-1 rounded-full bg-border hidden sm:block" />
          
          <Link 
            href="https://github.com/SH20RAJ/debo/issues" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <Heart className="w-4 h-4 group-hover:text-primary transition-colors" />
            <span>Help us build the future</span>
          </Link>
          
          <div className="w-1 h-1 rounded-full bg-border hidden sm:block" />
          
          <Link 
            href="/terms" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span>Terms of Service</span>
          </Link>
        </div>

      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
