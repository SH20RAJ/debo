import Link from "next/link";
import {
  Sparkles,
  Brain,
  Mic,
  Database,
  Zap,
  Shield,
  Bot,
  Lock,
  Terminal,
  type LucideIcon
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debo — The Vision",
  description: "A personal intelligence layer for your life documentary.",
};

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Vision Hero */}
      <section className="relative px-6 pt-24 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/[0.04] to-transparent pointer-events-none" />

        <div className="mx-auto max-w-5xl relative z-10 text-center lg:text-left">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border-2 border-primary/20 bg-primary/5 text-primary font-extrabold tracking-widest text-[10px] uppercase mx-auto lg:mx-0">
                <Sparkles className="h-3.5 w-3.5" />
                Project Intelligence
              </div>
              <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight leading-[1.05] text-foreground">
                Collaborative <br />
                <span className="text-primary">Intelligence.</span>
              </h1>
              <p className="max-w-xl text-base md:text-lg font-semibold leading-relaxed text-muted-foreground mx-auto lg:mx-0">
                Debo is a multimodal intelligence lab. We build systems that don&apos;t just store data, but think with you — turning raw research into a private, connected memory graph.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row justify-center lg:justify-start">
                <Link href="/#waitlist" className="minimal-btn-primary px-8 py-3 text-sm">
                  Join the Lab
                </Link>
                <Link href="#vision" className="minimal-btn-outline px-8 py-3 text-sm">
                  Research Vision
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="duo-card p-10 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/40">
                    <span>Active Stream</span>
                    <div className="flex items-center gap-1.5">
                      <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                      Live
                    </div>
                  </div>
                  <div className="p-5 bg-muted/30 rounded-2xl border-2 border-border/50">
                    <p className="text-sm font-semibold text-foreground/60 italic leading-relaxed">
                      &ldquo;Remember to follow up on the memory engine proposal.&rdquo;
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2.5 rounded-xl border-2 border-primary/20 bg-primary/5 text-[10px] font-extrabold text-primary uppercase tracking-widest">
                    Fact Extracted
                  </div>
                  <div className="px-4 py-2.5 rounded-xl border-2 border-primary/20 bg-primary/5 text-[10px] font-extrabold text-primary uppercase tracking-widest">
                    Pattern Logged
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Cognitive Crisis */}
      <section id="vision" className="bg-muted/30 border-y-2 border-border/10 px-6 py-24">
        <div className="mx-auto max-w-5xl text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-foreground tracking-tight">
              Information <span className="text-primary">without meaning.</span>
            </h2>
            <p className="text-base md:text-lg font-semibold text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We capture everything but remember nothing. Our journals are graveyards of thoughts, and our memories are fading silos.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
             {[
               { label: "Fading Memory", desc: "Context lost over time." },
               { label: "Fragmented Data", desc: "Scattered across apps." },
               { label: "Lost Insights", desc: "No way to find patterns." }
             ].map((item, i) => (
               <div key={i} className="duo-card p-8 text-center space-y-4">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-primary mb-2">Issue {i + 1}</div>
                  <div className="font-bold text-base text-foreground">{item.label}</div>
                  <div className="text-xs font-medium text-muted-foreground leading-relaxed">{item.desc}</div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* The Core Capabilities */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
           <div className="text-center lg:text-left mb-20 space-y-4">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Capabilities</div>
              <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-foreground tracking-tight">
                Built for <span className="text-primary">permanence.</span>
              </h2>
           </div>

           <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Zap}
                title="Multimodal Engine"
                desc="Process research papers, images, and voice into a unified context."
              />
              <FeatureCard
                icon={Terminal}
                title="Tinker API"
                desc="Researcher-grade controls for personal model fine-tuning (LoRA)."
              />
              <FeatureCard
                icon={Brain}
                title="Connectionism"
                desc="Identify hidden relationship manifolds across your knowledge base."
              />
              <FeatureCard
                icon={Shield}
                title="Private Core"
                desc="End-to-end private intelligence. No ads. No public training."
              />
              <FeatureCard
                icon={Bot}
                title="Jarvis Voice"
                desc="Real-time multimodal voice interactions with sub-second response."
              />
              <FeatureCard
                icon={Database}
                title="Memory Graph"
                desc="Connect people, facts, and emotions into a permanent graph."
              />
           </div>
        </div>
      </section>

      {/* The Ethics */}
      <section className="px-6 py-24 bg-muted/30 border-t-2 border-border/10">
         <div className="mx-auto max-w-5xl">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
               <div className="space-y-10">
                  <div className="space-y-4">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Philosophy</div>
                    <h3 className="text-4xl md:text-5xl font-heading font-extrabold text-foreground tracking-tight">The property of mind.</h3>
                  </div>
                  <div className="space-y-8">
                     <Pillar title="Expressive" text="Simple, direct, and active language." />
                     <Pillar title="Playful" text="Light interaction, serious utility." />
                     <Pillar title="Embracing" text="Designed for human growth." />
                     <Pillar title="Private" text="No tracking. No ads. No training." />
                  </div>
               </div>
               <div className="duo-card p-10 flex flex-col justify-between space-y-10">
                  <div className="space-y-5">
                     <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/5 text-primary">
                        <Shield className="h-6 w-6" />
                     </div>
                     <h4 className="text-2xl font-bold text-foreground tracking-tight leading-tight">Your data is yours.</h4>
                     <p className="text-base font-semibold text-muted-foreground leading-relaxed">
                        We don&apos;t sell insights. We don&apos;t train on your life. Debo is a private instance, grounded only in what you tell it.
                     </p>
                  </div>
                  <Link href="/#waitlist" className="minimal-btn-primary w-full py-3 text-sm">
                     Join Waitlist
                  </Link>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-border/10 bg-background px-6 py-16">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="font-heading font-extrabold text-sm leading-none">d</span>
              </div>
              <span className="text-lg font-heading font-extrabold tracking-tight text-foreground">
                debo
              </span>
           </div>
           <div className="flex gap-8 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/40">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/pitch" className="text-primary">Vision</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: LucideIcon, title: string, desc: string }) {
  return (
    <div className="minimal-card p-6 group">
       <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
          <Icon className="h-5 w-5" />
       </div>
       <h3 className="mb-2 text-base font-bold text-foreground tracking-tight">{title}</h3>
       <p className="text-xs font-medium text-muted-foreground leading-relaxed">
          {desc}
       </p>
    </div>
  );
}

function Pillar({ title, text }: { title: string, text: string }) {
  return (
    <div className="flex gap-5 group">
       <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 mt-1 transition-colors group-hover:border-primary">
          <div className="size-1 bg-primary/30 group-hover:bg-primary transition-colors rounded-full" />
       </div>
       <div className="space-y-1">
          <h4 className="text-base font-bold text-foreground tracking-tight">{title}</h4>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">{text}</p>
       </div>
    </div>
  );
}
