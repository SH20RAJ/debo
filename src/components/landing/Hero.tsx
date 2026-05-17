"use client";

import { ArrowRight, FileText, Mic, Users, CheckSquare, Database } from "lucide-react";
import { waitlistUrl } from "@/lib/launch";
import Link from "next/link";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path>
  </svg>
);

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-32 md:pt-40 md:pb-40 bg-landing-bg">
      <div className="container relative z-10 mx-auto max-w-[1120px]">
        <div className="flex flex-col items-center text-center space-y-10">
          
          <h1 className="font-heading text-5xl font-semibold tracking-tight text-landing-text-primary md:text-6xl lg:text-7xl max-w-4xl leading-[1.05]">
            Your private memory layer for everything you forget.
          </h1>

          <p className="mx-auto max-w-2xl text-lg md:text-[20px] font-medium leading-relaxed text-landing-text-secondary">
            Debo captures voice notes, journals, links, tasks, and conversations — then lets you ask your past with source-backed answers.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
            <Link
              href={waitlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-landing-accent px-8 text-[15px] font-semibold text-white transition-all hover:bg-landing-accent-hover hover:-translate-y-0.5 shadow-sm hover:shadow-md gap-2"
            >
              Join private beta
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/sh20raj/debo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-landing-border bg-landing-surface px-8 text-[15px] font-semibold text-landing-text-primary transition-all hover:bg-landing-surface-subtle hover:-translate-y-0.5 gap-2 shadow-sm"
            >
              <GithubIcon className="h-[18px] w-[18px]" />
              View GitHub
            </a>
          </div>

          <p className="text-[13px] font-medium text-landing-text-tertiary pt-2">
            Private beta opens July 28, 2026. Public launch planned for September 17, 2026.
          </p>

        </div>

        {/* Hero Visual Mockup */}
        <div className="mt-24 mx-auto max-w-[1024px]">
          <div className="rounded-[24px] border border-landing-border bg-landing-surface shadow-xl shadow-black/[0.04] overflow-hidden flex flex-col md:flex-row min-h-[500px]">
            {/* Sidebar */}
            <div className="hidden md:flex flex-col w-[260px] border-r border-landing-border-light bg-landing-surface-subtle p-5 space-y-8">
              <div className="flex items-center gap-2 px-1">
                <div className="w-[11px] h-[11px] rounded-full bg-landing-border"></div>
                <div className="w-[11px] h-[11px] rounded-full bg-landing-border"></div>
                <div className="w-[11px] h-[11px] rounded-full bg-landing-border"></div>
              </div>
              <nav className="space-y-1">
                <div className="text-[11px] font-bold text-landing-text-tertiary px-2 mb-4 tracking-wider">LIBRARY</div>
                <SidebarItem icon={<FileText className="w-[15px] h-[15px]" />} label="Journal" />
                <SidebarItem icon={<Mic className="w-[15px] h-[15px]" />} label="Voice" />
                <SidebarItem icon={<Users className="w-[15px] h-[15px]" />} label="People" />
                <SidebarItem icon={<CheckSquare className="w-[15px] h-[15px]" />} label="Tasks" />
                <SidebarItem icon={<Database className="w-[15px] h-[15px]" />} label="Sources" />
              </nav>
            </div>
            
            {/* Main Panel */}
            <div className="flex-1 bg-landing-surface flex flex-col">
              <div className="h-16 border-b border-landing-border-light flex items-center px-8">
                <span className="text-[14px] font-medium text-landing-text-secondary">Memory Search</span>
              </div>
              <div className="flex-1 p-8 md:p-10 space-y-8">
                
                {/* User Query */}
                <div className="flex justify-end">
                  <div className="bg-[#F4F5F4] px-5 py-3.5 rounded-[18px] rounded-tr-sm max-w-[85%] md:max-w-md border border-[#EEEEEE]">
                    <p className="text-[15px] font-medium text-landing-text-primary">What did I promise Raj about the Q4 budget?</p>
                  </div>
                </div>

                {/* Debo Answer */}
                <div className="flex justify-start">
                  <div className="border border-landing-border-light bg-landing-surface shadow-sm px-6 py-5 rounded-[20px] rounded-tl-sm max-w-[95%] md:max-w-2xl space-y-5">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-6 h-6 rounded bg-landing-accent/10 flex items-center justify-center border border-landing-accent/20">
                        <span className="text-xs font-bold text-landing-accent">d</span>
                      </div>
                      <span className="text-[13px] font-semibold text-landing-text-secondary">Debo</span>
                    </div>
                    <p className="text-[15px] leading-relaxed text-landing-text-primary">
                      During your marketing sync on Tuesday, you promised Raj that you would submit the finalized Q4 budget allocation by this Friday before the board meeting. You also noted that you need to prioritize ad spend for the new product launch.
                    </p>
                    <div className="pt-4 border-t border-landing-border-light flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-landing-surface-subtle border border-landing-border text-[11px] font-medium text-landing-text-secondary transition-colors hover:bg-landing-border-light">
                        <Mic className="w-3.5 h-3.5 text-landing-text-tertiary" /> Voice note (Tuesday)
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-landing-surface-subtle border border-landing-border text-[11px] font-medium text-landing-text-secondary transition-colors hover:bg-landing-border-light">
                        <Users className="w-3.5 h-3.5 text-landing-text-tertiary" /> Meeting: Marketing Sync
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-landing-surface-subtle border border-landing-border text-[11px] font-medium text-landing-text-secondary transition-colors hover:bg-landing-border-light">
                        <CheckSquare className="w-3.5 h-3.5 text-landing-text-tertiary" /> Task
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline memory card */}
                <div className="flex justify-start pt-2">
                   <div className="ml-[18px] border-l border-landing-border pl-6 py-2 relative">
                     <div className="absolute w-[7px] h-[7px] rounded-full bg-landing-border -left-[4px] top-[22px]"></div>
                     <div className="text-[10px] font-bold text-landing-text-tertiary uppercase tracking-widest mb-3 pl-1">Related Memory</div>
                     <div className="bg-landing-surface border border-landing-border-light p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer w-64 md:w-72">
                       <p className="text-[13px] font-medium text-landing-text-primary mb-1">Q4 Allocation Draft.pdf</p>
                       <p className="text-[12px] text-landing-text-tertiary">Uploaded 2 days ago</p>
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
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-landing-border-light cursor-pointer text-[13px] font-medium text-landing-text-secondary transition-colors">
      {icon}
      <span>{label}</span>
    </div>
  );
}
