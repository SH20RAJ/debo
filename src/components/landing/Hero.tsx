"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Brain, Sparkles, MessageSquare, Mic2, Zap, BarChart3, Globe, Shield } from "lucide-react";

type HeroProps = {
  isSignedIn?: boolean;
};

export function Hero({ isSignedIn = false }: HeroProps) {
  return (
    <section className="relative overflow-hidden py-24 md:py-40 bg-background">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-duo-feather/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-duo-feather/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-duo-green/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-5xl px-6">
        <div className="text-center space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-duo-feather/10 border border-duo-feather/20 hover:scale-105 transition-transform cursor-pointer">
            <Sparkles className="h-4 w-4 text-duo-feather animate-pulse" />
            <span className="text-sm font-black text-duo-feather uppercase tracking-wider">Life Intelligence System</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-black text-duo-eel leading-[1.05]">
            Your second brain for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-duo-feather to-duo-green">real life memory</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-duo-wolf font-bold max-w-3xl mx-auto leading-relaxed">
            Debo captures what matters. Ask questions about your past,
            discover patterns in your behavior, and turn scattered notes into clarity.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
            {isSignedIn ? (
              <Button asChild size="lg" className="h-14 px-10 rounded-2xl bg-duo-feather hover:bg-duo-feather/90 shadow-xl shadow-duo-feather-shadow/20 text-lg font-black">
                <Link href="/dashboard" className="flex items-center gap-3">
                  Open Dashboard <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="h-14 px-10 rounded-2xl bg-duo-feather hover:bg-duo-feather/90 shadow-xl shadow-duo-feather-shadow/20 text-lg font-black">
                  <Link href="/join">Start Free</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-2xl border-2 border-duo-swan/50 text-lg font-black">
                  <Link href="#features">See Features</Link>
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-duo-green/10">
                <Brain className="h-6 w-6 text-duo-green" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-duo-eel">AI Memory</p>
                <p className="text-sm font-bold text-duo-swan">Smart storage</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-duo-blue/10">
                <BarChart3 className="h-6 w-6 text-duo-blue" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-duo-eel">Pattern Detection</p>
                <p className="text-sm font-bold text-duo-swan">Auto-insights</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-duo-purple/10">
                <Globe className="h-6 w-6 text-duo-purple" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-duo-eel">MCP API</p>
                <p className="text-sm font-bold text-duo-swan">Connect anything</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-duo-orange/10">
                <Shield className="h-6 w-6 text-duo-orange" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-duo-eel">100% Private</p>
                <p className="text-sm font-bold text-duo-swan">Your data yours</p>
              </div>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 pt-6">
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-duo-swan/30 text-sm font-bold text-duo-wolf">
              <MessageSquare className="h-4 w-4 text-duo-macaw" />
              Ask Your Life
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-duo-swan/30 text-sm font-bold text-duo-wolf">
              <Mic2 className="h-4 w-4 text-duo-beetle" />
              Voice Capture
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-duo-swan/30 text-sm font-bold text-duo-wolf">
              <Zap className="h-4 w-4 text-duo-fox" />
              Auto-Sync Apps
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-duo-swan/30 text-sm font-bold text-duo-wolf">
              <Sparkles className="h-4 w-4 text-duo-green" />
              Timeline View
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}