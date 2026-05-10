"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Brain, Zap, Shield, Terminal, Sparkles, Globe, Cpu } from "lucide-react";

type HeroProps = {
  isSignedIn?: boolean;
};

export function Hero({ isSignedIn = false }: HeroProps) {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center bg-[#0a0f14]">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-emerald-500/5 to-transparent rounded-full" />
      </div>

      <div className="container mx-auto max-w-6xl px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 hover:scale-105 transition-transform cursor-pointer">
              <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Personal Intelligence</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
              Your second brain for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                real life
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed">
              Debo remembers what matters. Ask questions about your past, discover patterns in your behavior, and turn scattered notes into clarity. Now with MCP - connect from any AI agent.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {isSignedIn ? (
                <Button asChild size="lg" className="h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/25">
                  <Link href="/dashboard" className="flex items-center gap-3">
                    Open Dashboard <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/25">
                    <Link href="/join">Start Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-2xl border-2 border-gray-700 text-white font-bold text-lg hover:border-emerald-500/50 hover:bg-emerald-500/5">
                    <Link href="#features">See Features</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-gray-300">
                <Brain className="h-4 w-4 text-emerald-400" />
                AI Memory
              </span>
              <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-gray-300">
                <Zap className="h-4 w-4 text-cyan-400" />
                MCP Integration
              </span>
              <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-gray-300">
                <Shield className="h-4 w-4 text-emerald-400" />
                100% Private
              </span>
            </div>
          </div>

          {/* Right Content - Code/MCP Demo */}
          <div className="relative">
            <div className="relative bg-[#0d1117] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              {/* Terminal Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-gray-800">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-xs text-gray-500 font-mono">Debo MCP</span>
              </div>

              {/* Terminal Body */}
              <div className="p-6 font-mono text-sm">
                <div className="space-y-4">
                  <div className="text-gray-400">
                    <span className="text-emerald-400">$</span> ask_debo "what patterns do you see in my journal?"
                  </div>
                  <div className="text-gray-300 pl-4 border-l-2 border-emerald-500/30">
                    <p className="text-emerald-400 font-bold mb-2">→ Pattern Analysis:</p>
                    <p className="text-gray-400 mb-2">Based on your last 30 journal entries, I notice:</p>
                    <ul className="space-y-1 text-gray-300">
                      <li>• <span className="text-cyan-400">Growth mindset</span> - 12 mentions of learning, growth</li>
                      <li>• <span className="text-cyan-400">Creative flow</span> - 8 mentions of creative work</li>
                      <li>• <span className="text-cyan-400">Health focus</span> - 5 mentions of wellness routines</li>
                    </ul>
                    <p className="text-gray-500 mt-2 text-xs">Memories retrieved: 23 | Journals analyzed: 30</p>
                  </div>

                  <div className="text-gray-400 pt-2">
                    <span className="text-emerald-400">$</span> get_info depth: "brief"
                  </div>
                  <div className="text-gray-300 pl-4 border-l-2 border-cyan-500/30">
                    <p className="text-cyan-400 font-bold">→ Life Documentary (brief)</p>
                    <p className="text-gray-400 mt-1">Key facts: 15 | Recent journals: 10 | Top patterns: 3</p>
                  </div>
                </div>

                {/* MCP Config Card */}
                <div className="mt-6 p-4 bg-[#0d1117] rounded-xl border border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Connect via MCP</span>
                  </div>
                  <pre className="text-xs text-gray-400 overflow-x-auto">
{`{
  "mcpServers": {
    "debo": {
      "command": "npx",
      "args": ["-y", "@debo/mcp"]
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-[#0d1117] border border-gray-800 rounded-xl p-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-lg font-bold text-white">MCP Ready</p>
                    <p className="text-xs text-gray-500">Connect from any AI</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-[#0d1117] border border-gray-800 rounded-xl p-3 shadow-xl">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-sm font-bold text-white">Claude, Cursor,</p>
                  <p className="text-xs text-gray-500">LobeChat & more</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-16 pt-8 border-t border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <Brain className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-white">Smart Memory</p>
              <p className="text-sm text-gray-500">AI-powered recall</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10">
              <Terminal className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-white">MCP API</p>
              <p className="text-sm text-gray-500">Connect any agent</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <Shield className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-white">100% Private</p>
              <p className="text-sm text-gray-500">Your data stays yours</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}