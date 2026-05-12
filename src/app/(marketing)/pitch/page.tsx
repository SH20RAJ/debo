import Link from "next/link";
import { 
  Sparkles, 
  Brain, 
  Mic, 
  Database, 
  Zap, 
  Heart, 
  Shield,
  Bot,
  ArrowRight,
  User,
  CheckCircle2,
  Lock
} from "lucide-react";
import { Metadata } from "next";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Debo — The Vision",
  description: "A personal intelligence layer for your life documentary.",
};

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Vision Hero */}
      <section className="relative px-6 pt-32 pb-40 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
        
        <div className="mx-auto max-w-7xl relative z-10 text-center lg:text-left">
          <div className="grid gap-20 lg:grid-cols-2 lg:items-center">
            <div className="space-y-12">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/10 bg-primary/[0.03] text-primary/40 font-bold tracking-[0.2em] text-[10px] uppercase mx-auto lg:mx-0">
                <Sparkles className="h-3.5 w-3.5" />
                Project Intelligence
              </div>
              <h1 className="text-6xl md:text-8xl font-heading font-semibold tracking-tighter leading-[0.95] text-foreground">
                Your second <br />
                <span className="text-primary/40">brain.</span>
              </h1>
              <p className="max-w-xl text-xl md:text-2xl font-medium leading-relaxed text-muted-foreground/60 mx-auto lg:mx-0 tracking-tight">
                Debo is a calm, personal memory engine. It remembers what you say, connects the patterns, and helps you reflect in real-time.
              </p>
              <div className="flex flex-col gap-6 sm:flex-row justify-center lg:justify-start">
                <Link href="/join" className="minimal-btn-primary h-14 px-10 text-xs font-bold uppercase tracking-[0.2em] shadow-2xl shadow-primary/20">
                  Initialize Memory
                </Link>
                <Link href="#vision" className="minimal-btn-outline h-14 px-10 text-xs font-bold uppercase tracking-[0.2em] border border-border/40 bg-card/40 backdrop-blur-sm">
                  The Protocol
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-3xl border border-border/40 bg-card/30 backdrop-blur-3xl p-12 shadow-2xl shadow-primary/[0.02] space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30">
                    <span>Active Stream</span>
                    <div className="flex items-center gap-1.5">
                      <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                      Live
                    </div>
                  </div>
                  <div className="p-6 bg-muted/10 rounded-2xl border border-border/20">
                    <p className="text-sm font-medium text-foreground/40 italic leading-relaxed">
                      "Remember to follow up on the memory engine proposal."
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-5 py-3 rounded-xl bg-primary/[0.02] border border-primary/10 text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                    Fact Extracted
                  </div>
                  <div className="px-5 py-3 rounded-xl bg-primary/[0.02] border border-primary/10 text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                    Pattern Logged
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Cognitive Crisis */}
      <section id="vision" className="bg-card/30 border-y border-border/20 px-6 py-32">
        <div className="mx-auto max-w-5xl text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-heading font-semibold text-foreground tracking-tight">
              Information <span className="text-primary/40 italic">without meaning.</span>
            </h2>
            <p className="text-lg md:text-xl font-medium text-muted-foreground/60 max-w-2xl mx-auto leading-relaxed">
              We capture everything but remember nothing. Our journals are graveyards of thoughts, and our memories are fading silos.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
             {[
               { label: "Fading Memory", desc: "Context lost over time." },
               { label: "Fragmented Data", desc: "Scattered across apps." },
               { label: "Lost Insights", desc: "No way to find patterns." }
             ].map((item, i) => (
               <div key={i} className="rounded-2xl border border-border/30 bg-background/50 p-8 text-center space-y-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40 mb-2">Issue {i + 1}</div>
                  <div className="font-bold text-base text-foreground/80">{item.label}</div>
                  <div className="text-xs font-medium text-muted-foreground/40 leading-relaxed">{item.desc}</div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* The Core Capabilities */}
      <section className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
           <div className="text-center lg:text-left mb-24 space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Capabilities</div>
              <h2 className="text-4xl md:text-6xl font-heading font-semibold text-foreground tracking-tight">
                Built for <span className="text-primary/40 italic">permanence.</span>
              </h2>
           </div>

           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard 
                icon={Mic}
                title="Ambient Voice"
                desc="Record thoughts as they happen. Sub-100ms processing."
              />
              <FeatureCard 
                icon={Database}
                title="Atomic Memory"
                desc="Facts extracted into a clean, searchable database."
              />
              <FeatureCard 
                icon={Brain}
                title="Pattern Engine"
                desc="Identify recurring themes and growth areas automatically."
              />
              <FeatureCard 
                icon={Lock}
                title="Private Core"
                desc="Your data is encrypted and grounded only in your evidence."
              />
              <FeatureCard 
                icon={Zap}
                title="High Density"
                desc="Minimalist UI designed for power users and speed."
              />
              <FeatureCard 
                icon={Bot}
                title="MCP Integrated"
                desc="Connect your memory to any AI tool seamlessly."
              />
           </div>
        </div>
      </section>

      {/* The Ethics */}
      <section className="px-6 py-32 bg-card/20 border-t border-border/10">
         <div className="mx-auto max-w-7xl">
            <div className="grid gap-20 lg:grid-cols-2 items-center">
               <div className="space-y-12">
                  <div className="space-y-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Philosophy</div>
                    <h3 className="text-4xl md:text-5xl font-heading font-semibold text-foreground tracking-tight">The property of mind.</h3>
                  </div>
                  <div className="space-y-10">
                     <Pillar title="Expressive" text="Simple, direct, and active language." />
                     <Pillar title="Playful" text="Light interaction, serious utility." />
                     <Pillar title="Embracing" text="Designed for human growth." />
                     <Pillar title="Private" text="No tracking. No ads. No training." />
                  </div>
               </div>
               <div className="rounded-3xl border border-border/40 bg-background/50 p-12 shadow-2xl shadow-primary/[0.01] flex flex-col justify-between space-y-12">
                  <div className="space-y-6">
                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 text-primary/40">
                        <Shield className="h-6 w-6" />
                     </div>
                     <h4 className="text-3xl font-semibold text-foreground/80 tracking-tight leading-tight">Your data is yours.</h4>
                     <p className="text-lg font-medium text-muted-foreground/40 leading-relaxed">
                        We don't sell insights. We don't train on your life. Debo is a private instance, grounded only in what you tell it.
                     </p>
                  </div>
                  <Link href="/join" className="minimal-btn-primary h-14 w-full text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/20">
                     Start Now
                  </Link>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/10 bg-background px-6 py-20">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 border border-primary/10 text-primary/40">
                <Database className="h-4 w-4" />
              </div>
              <span className="text-xl font-heading font-semibold tracking-tight text-foreground/80">
                debo
              </span>
           </div>
           <div className="flex gap-10 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/20">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/pitch" className="text-primary">Vision</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="group rounded-2xl border border-border/20 bg-card/10 p-10 transition-all hover:border-primary/20">
       <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 text-primary/40 group-hover:text-primary transition-colors">
          <Icon className="h-6 w-6" />
       </div>
       <h3 className="mb-3 text-lg font-bold text-foreground/80 tracking-tight">{title}</h3>
       <p className="text-xs font-medium text-muted-foreground/40 leading-relaxed">
          {desc}
       </p>
    </div>
  );
}

function Pillar({ title, text }: { title: string, text: string }) {
  return (
    <div className="flex gap-6 group">
       <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/20 mt-1 transition-colors group-hover:border-primary">
          <div className="size-1 bg-primary/20 group-hover:bg-primary transition-colors rounded-full" />
       </div>
       <div className="space-y-1">
          <h4 className="text-base font-bold text-foreground/80 tracking-tight">{title}</h4>
          <p className="text-sm font-medium text-muted-foreground/40 leading-relaxed">{text}</p>
       </div>
    </div>
  );
}
