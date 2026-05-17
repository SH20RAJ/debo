"use client";

import { ArrowRight, Brain, Search, Shield, Zap, User, Clock, FileText, Mic, Users, CheckSquare, Database } from "lucide-react";
import { waitlistUrl } from "@/lib/launch";
import Link from "next/link";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path>
  </svg>
);

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-24 md:pt-32 md:pb-32 bg-background">
      <div className="container relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center space-y-8">
          
          <h1 className="font-heading text-5xl font-extrabold tracking-tight text-foreground md:text-6xl lg:text-7xl max-w-4xl leading-[1.1]">
            Your private memory layer for everything you forget.
          </h1>

          <p className="mx-auto max-w-2xl text-lg md:text-xl font-medium leading-relaxed text-muted-foreground">
            Debo captures voice notes, journals, links, tasks, and conversations — then lets you ask your past with source-backed answers.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link
              href={waitlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-foreground px-8 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 gap-2 shadow-sm"
            >
              Join private beta
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/sh20raj/debo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-background px-8 text-sm font-semibold text-foreground transition-colors hover:bg-muted gap-2 shadow-sm"
            >
              <GithubIcon className="h-4 w-4" />
              View GitHub
            </a>
          </div>

          <p className="text-sm font-medium text-muted-foreground/60">
            Private beta opens July 28, 2026. Public launch planned for September 17, 2026.
          </p>

        </div>

        {/* Hero Visual Mockup */}
        <div className="mt-20 mx-auto max-w-5xl">
          <div className="rounded-xl border border-border/60 bg-background shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[480px]">
            {/* Sidebar */}
            <div className="hidden md:flex flex-col w-64 border-r border-border/40 bg-muted/20 p-4 space-y-6">
              <div className="flex items-center gap-2 px-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>
              <nav className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground px-2 mb-3 mt-4">LIBRARY</div>
                <SidebarItem icon={<FileText className="w-4 h-4" />} label="Journal" />
                <SidebarItem icon={<Mic className="w-4 h-4" />} label="Voice" />
                <SidebarItem icon={<Users className="w-4 h-4" />} label="People" />
                <SidebarItem icon={<CheckSquare className="w-4 h-4" />} label="Tasks" />
                <SidebarItem icon={<Database className="w-4 h-4" />} label="Sources" />
              </nav>
            </div>
            
            {/* Main Panel */}
            <div className="flex-1 bg-background flex flex-col">
              <div className="h-14 border-b border-border/40 flex items-center px-6">
                <span className="text-sm font-semibold text-foreground/80">Memory Search</span>
              </div>
              <div className="flex-1 p-6 space-y-6">
                
                {/* User Query */}
                <div className="flex justify-end">
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-tr-sm max-w-md">
                    <p className="text-sm font-medium text-foreground">What did I promise Raj about the Q4 budget?</p>
                  </div>
                </div>

                {/* Debo Answer */}
                <div className="flex justify-start">
                  <div className="bg-primary/5 border border-primary/10 px-5 py-4 rounded-2xl rounded-tl-sm max-w-2xl space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary-foreground">d</span>
                      </div>
                      <span className="text-xs font-semibold text-primary">Debo</span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      During your marketing sync on Tuesday, you promised Raj that you would submit the finalized Q4 budget allocation by this Friday before the board meeting. You also noted that you need to prioritize ad spend for the new product launch.
                    </p>
                    <div className="pt-3 border-t border-primary/10 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-background border border-border text-[10px] font-semibold text-muted-foreground">
                        <Mic className="w-3 h-3" /> Voice note (Tuesday)
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-background border border-border text-[10px] font-semibold text-muted-foreground">
                        <Users className="w-3 h-3" /> Meeting: Marketing Sync
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-background border border-border text-[10px] font-semibold text-muted-foreground">
                        <CheckSquare className="w-3 h-3" /> Task
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline memory card */}
                <div className="flex justify-start pt-2">
                   <div className="ml-8 border-l-2 border-border/50 pl-4 py-1">
                     <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Related Memory</div>
                     <div className="bg-background border border-border/40 p-3 rounded-lg shadow-sm w-64">
                       <p className="text-xs font-medium text-foreground/80 mb-1">Q4 Allocation Draft.pdf</p>
                       <p className="text-[10px] text-muted-foreground">Uploaded 2 days ago</p>
                     </div>
                   </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SidebarItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 cursor-pointer text-sm font-medium text-foreground/80 transition-colors">
      {icon}
      <span>{label}</span>
    </div>
  );
}
