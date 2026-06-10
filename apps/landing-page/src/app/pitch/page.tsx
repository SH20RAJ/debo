import Link from "next/link";
import {
  Sparkles,
  Brain,
  Zap,
  Shield,
  Bot,
  Database,
  Terminal,
  FileDown,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debo | Your Life’s MCP",
  description: "The foundational memory layer for personal intelligence. Build a searchable knowledge graph and give your personal AI the context of your entire life.",
  openGraph: {
    title: "Debo: The Memory Context Protocol for Humans",
    description: "AI without memory is temporary. Debo provides the permanent context layer that turns your history into a searchable personal intelligence protocol.",
  },
};

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-landing-bg text-landing-text-primary font-sans selection:bg-landing-accent/20">
      {/* Vision Hero */}
      <section className="relative px-6 pt-24 pb-32 overflow-hidden">
        <div className="mx-auto max-w-[1120px] relative z-10 text-center lg:text-left">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-landing-border bg-landing-surface text-landing-accent font-semibold tracking-wider text-landing-xs uppercase mx-auto lg:mx-0 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                The Memory Context Protocol
              </div>
              <h1 className="text-5xl md:text-7xl font-heading font-semibold tracking-tight leading-[1.05] text-landing-text-primary">
                Your life&apos;s <br />
                <span className="text-landing-accent">MCP.</span>
              </h1>
              <p className="max-w-xl text-landing-base md:text-landing-lg font-medium leading-relaxed text-landing-text-secondary mx-auto lg:mx-0">
                AI without memory is temporary. Debo is the permanent infrastructure that turns your journals, voice recordings, and documents into a searchable context layer for personal intelligence.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row justify-center lg:justify-start">
                <Link href="/#waitlist" className="inline-flex h-12 items-center justify-center rounded-xl bg-landing-accent px-8 text-landing-sm font-semibold text-white transition-all hover:bg-landing-accent-hover hover:-translate-y-0.5 shadow-sm hover:shadow-md">
                  Join Private Beta
                </Link>
                <a href="/pitch.pdf" download className="inline-flex h-12 items-center justify-center rounded-xl border border-landing-border bg-landing-surface px-8 text-landing-sm font-semibold text-landing-text-primary transition-all hover:bg-landing-surface-subtle hover:-translate-y-0.5 shadow-sm gap-2">
                  <FileDown className="h-4 w-4 text-landing-accent" />
                  Download Deck
                </a>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="p-10 border border-landing-border bg-landing-surface rounded-[24px] space-y-8 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-landing-xs font-bold uppercase tracking-widest text-landing-text-tertiary">
                    <span>Memory Stream</span>
                    <div className="flex items-center gap-1.5">
                      <div className="size-1.5 rounded-full bg-landing-accent animate-pulse" />
                      Live
                    </div>
                  </div>
                  <div className="p-5 bg-landing-bg rounded-2xl border border-landing-border">
                    <p className="text-landing-sm font-medium text-landing-text-secondary italic leading-relaxed">
                      &ldquo;What startup ideas have I discussed in the last month?&rdquo;
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2.5 rounded-xl border border-landing-border bg-landing-bg text-landing-xs font-semibold text-landing-text-primary uppercase tracking-wider">
                    Context Extracted
                  </div>
                  <div className="px-4 py-2.5 rounded-xl border border-landing-border bg-landing-bg text-landing-xs font-semibold text-landing-text-primary uppercase tracking-wider">
                    Graph Updated
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Cognitive Crisis */}
      <section id="vision" className="bg-landing-surface border-t border-landing-border-light px-6 py-24">
        <div className="mx-auto max-w-[1120px] text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-heading font-semibold text-landing-text-primary tracking-tight">
              Information is abundant. <br /><span className="text-landing-accent">Context is extinct.</span>
            </h2>
            <p className="text-landing-base md:text-landing-lg font-medium text-landing-text-secondary max-w-2xl mx-auto leading-relaxed">
              We capture everything but remember nothing. Our journals are graveyards of thoughts, and our memories are fading silos. AI without personal context is just a clever toy.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
             {[
               { label: "Fading Context", desc: "Great ideas lost to the noise of daily life." },
               { label: "Fragmented Silos", desc: "Your knowledge is scattered across 10+ apps." },
               { label: "Static Intelligence", desc: "AI that doesn't know who you are or what you've done." }
             ].map((item, i) => (
               <div key={i} className="p-8 border border-landing-border bg-landing-bg rounded-[20px] text-center space-y-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  <div className="text-landing-xs font-bold uppercase tracking-widest text-landing-accent mb-2">Problem {i + 1}</div>
                  <div className="font-bold text-landing-base text-landing-text-primary">{item.label}</div>
                  <div className="text-landing-xs font-medium text-landing-text-secondary leading-relaxed">{item.desc}</div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* The Core Capabilities */}
      <section className="px-6 py-24 border-t border-landing-border-light bg-landing-bg">
        <div className="mx-auto max-w-[1120px]">
           <div className="text-center lg:text-left mb-20 space-y-4">
              <div className="text-landing-xs font-bold uppercase tracking-widest text-landing-accent">Capabilities</div>
              <h2 className="text-4xl md:text-5xl font-heading font-semibold text-landing-text-primary tracking-tight">
                Built for <span className="text-landing-accent">permanence.</span>
              </h2>
           </div>

           <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Zap}
                title="Omniscient Capture"
                desc="Ingest journals, voice notes, PDFs, and conversations into one unified stream."
              />
              <FeatureCard
                icon={Terminal}
                title="Searchable History"
                desc="Every goal set, promise made, and decision logged—instantly accessible forever."
              />
              <FeatureCard
                icon={Brain}
                title="Context Synthesis"
                desc="Automatically extract people, projects, and decisions to build your knowledge graph."
              />
              <FeatureCard
                icon={Shield}
                title="Private Infrastructure"
                desc="Local-first, end-to-end encrypted, and sovereign. Your memory belongs to you."
              />
              <FeatureCard
                icon={Bot}
                title="Memory Retrieval"
                desc="Ask questions like 'What startup ideas have I discussed?' and get source-backed answers."
              />
              <FeatureCard
                icon={Database}
                title="Agentic Foundation"
                desc="The foundational API that allows future AI agents to understand your life's context."
              />
           </div>
        </div>
      </section>

      {/* The Ethics */}
      <section className="px-6 py-24 bg-landing-surface border-t border-landing-border-light">
         <div className="mx-auto max-w-[1120px]">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
               <div className="space-y-10">
                  <div className="space-y-4">
                    <div className="text-landing-xs font-bold uppercase tracking-widest text-landing-accent">Philosophy</div>
                    <h3 className="text-4xl md:text-5xl font-heading font-semibold text-landing-text-primary tracking-tight">Memory → Context → Intelligence.</h3>
                  </div>
                  <div className="space-y-8">
                     <Pillar title="Permanent" text="Built for decades, not sessions." />
                     <Pillar title="Private" text="Your data is never used for training." />
                     <Pillar title="Connected" text="Automated relationship mapping across your life." />
                     <Pillar title="Sovereign" text="You own the protocol and the data." />
                  </div>
               </div>
               <div className="p-10 border border-landing-border bg-landing-bg rounded-[24px] flex flex-col justify-between space-y-10 shadow-sm">
                  <div className="space-y-5">
                     <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-landing-border bg-landing-surface text-landing-accent shadow-sm">
                        <Shield className="h-6 w-6" />
                     </div>
                     <h4 className="text-landing-2xl font-bold text-landing-text-primary tracking-tight leading-tight">Your data is yours.</h4>
                     <p className="text-landing-base font-semibold text-landing-text-secondary leading-relaxed">
                        We don&apos;t sell insights. We don&apos;t train on your life. Debo is a private instance, grounded only in what you tell it. It is the context layer for you, and no one else.
                     </p>
                     <div className="pt-4">
                       <div className="text-landing-xs font-bold uppercase tracking-widest text-landing-accent mb-1">Strategic Contact</div>
                       <a href="mailto:founder@debo.life" className="text-landing-sm font-bold text-landing-text-primary hover:text-landing-accent transition-colors">founder@debo.life</a>
                     </div>
                  </div>
                  <Link href="/#waitlist" className="inline-flex h-12 items-center justify-center rounded-xl bg-landing-accent px-8 text-landing-sm font-semibold text-white transition-all hover:bg-landing-accent-hover hover:-translate-y-0.5 shadow-sm hover:shadow-md">
                     Join Private Beta
                  </Link>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-6 border border-landing-border bg-landing-surface rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
       <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-landing-border bg-landing-bg text-landing-accent shadow-sm transition-colors">
          <Icon className="h-5 w-5" />
       </div>
       <h3 className="mb-2 text-landing-base font-bold text-landing-text-primary tracking-tight">{title}</h3>
       <p className="text-landing-xs font-medium text-landing-text-secondary leading-relaxed">
          {desc}
       </p>
    </div>
  );
}

function Pillar({ title, text }: { title: string, text: string }) {
  return (
    <div className="flex gap-5 group">
       <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-landing-border mt-1 transition-colors bg-landing-bg">
          <div className="size-1 bg-landing-accent transition-colors rounded-full animate-pulse" />
       </div>
       <div className="space-y-1">
          <h4 className="text-landing-base font-bold text-landing-text-primary tracking-tight">{title}</h4>
          <p className="text-landing-sm font-medium text-landing-text-secondary leading-relaxed">{text}</p>
       </div>
    </div>
  );
}
