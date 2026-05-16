import Link from "next/link";
import {
  Brain,
  Shield,
  Zap,
  Globe,
  Terminal,
  Cpu,
  ArrowRight,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debo — The Lab",
  description: "Building the collaborative layer between human and artificial minds.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(88,204,2,0.05),transparent_70%)] pointer-events-none" />
        
        <div className="mx-auto max-w-4xl relative z-10">
          <div className="space-y-8 text-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border-2 border-primary/20 bg-primary/5 text-primary font-extrabold tracking-widest text-[10px] uppercase">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              The Intelligence Lab
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight leading-[1.05] text-foreground">
              Documenting <br />
              <span className="text-primary">Human Growth.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg md:text-xl font-semibold leading-relaxed text-muted-foreground">
              Debo is a multimodal intelligence lab dedicated to the personal 
              experience. We build systems that help you retain, connect, 
              and synthesize your life documentary.
            </p>
          </div>
        </div>
      </section>

      {/* The Mission */}
      <section className="px-6 py-24 border-y-2 border-border/10 bg-muted/30">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-16 md:grid-cols-2 items-start">
            <div className="space-y-6">
              <h2 className="text-3xl font-heading font-extrabold tracking-tight text-foreground">
                Collaborative Intelligence
              </h2>
              <p className="text-base font-medium leading-relaxed text-muted-foreground">
                We believe your digital memory should be more than a graveyard 
                of files. Debo uses multimodal research protocols to turn your 
                voice, journals, and cross-app data into a living, private 
                memory graph that grows with you.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/5 text-primary">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Grounded in Evidence</h4>
                  <p className="text-xs font-medium text-muted-foreground">Answers cited directly from your own life.</p>
                </div>
              </div>
            </div>
            <div className="duo-card p-8 space-y-6">
              <h3 className="text-xl font-bold text-foreground tracking-tight">The Lab Protocol</h3>
              <ul className="space-y-4">
                <ProtocolItem 
                  icon={Zap} 
                  title="Multimodal Ingestion" 
                  desc="Processing voice, papers, and complex data into a unified graph." 
                />
                <ProtocolItem 
                  icon={Terminal} 
                  title="Personal Tinker" 
                  desc="Researcher-grade control over your personal model fine-tuning." 
                />
                <ProtocolItem 
                  icon={Brain} 
                  title="Latent Connectionism" 
                  desc="Discovering hidden relationship manifolds across your history." 
                />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Design Philosophy */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div className="duo-card p-10 bg-primary/5 border-primary/10 space-y-6 order-2 lg:order-1">
              <h3 className="text-2xl font-heading font-extrabold tracking-tight text-foreground">Editorial Calm.</h3>
              <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                Our design system is built on the principle of Editorial Calm. 
                Inspired by high-end magazines and industrial design, we use 
                generous whitespace, bold typography, and subtle micro-interactions 
                to create an environment that encourages deep focus and reflection.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full border-2 border-primary/20 text-[8px] font-extrabold uppercase tracking-widest text-primary">Typography First</span>
                <span className="px-3 py-1 rounded-full border-2 border-primary/20 text-[8px] font-extrabold uppercase tracking-widest text-primary">Minimal UI</span>
                <span className="px-3 py-1 rounded-full border-2 border-primary/20 text-[8px] font-extrabold uppercase tracking-widest text-primary">High Density</span>
              </div>
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Philosophy</div>
              <h2 className="text-4xl font-heading font-extrabold tracking-tight text-foreground">Aesthetics for <br /><span className="text-primary">Cognition.</span></h2>
              <p className="text-base font-medium leading-relaxed text-muted-foreground">
                We believe that the beauty of a system directly impacts the 
                clarity of the thoughts processed within it. Debo is not just 
                a tool; it is a space for the mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Multimodal Flow */}
      <section className="px-6 py-24 bg-muted/30 border-y-2 border-border/10">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="text-center space-y-4">
             <h2 className="text-4xl font-heading font-extrabold tracking-tight text-foreground">The Data Documentary.</h2>
             <p className="mx-auto max-w-xl text-base font-medium text-muted-foreground leading-relaxed">
               How your life data transforms into collaborative intelligence.
             </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
             <FlowCard 
               step="01" 
               title="Ingestion" 
               desc="Voice, text, images, and cross-app streams are synchronized into a private raw log." 
             />
             <FlowCard 
               step="02" 
               title="Connectionism" 
               desc="Mastra agents extract entities, emotions, and facts, building a semantic memory graph." 
             />
             <FlowCard 
               step="03" 
               title="Synthesis" 
               desc="A personal intelligence layer trained on your evidence provides cited, proactive insights." 
             />
          </div>
        </div>
      </section>



      {/* Reach Out */}
      <section className="px-6 py-24 bg-muted/30 border-y-2 border-border/10">
        <div className="mx-auto max-w-4xl text-center space-y-12">
          <h2 className="text-4xl font-heading font-extrabold tracking-tight text-foreground">Reach out.</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="duo-card p-10 space-y-4">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Lab Operations</div>
              <a href="mailto:contact@debo.life" className="text-xl font-bold text-foreground hover:text-primary transition-colors">contact@debo.life</a>
              <p className="text-xs font-medium text-muted-foreground">General inquiries, press, and partnerships.</p>
            </div>
            <div className="duo-card p-10 space-y-4">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Direct Line</div>
              <a href="mailto:founder@debo.life" className="text-xl font-bold text-foreground hover:text-primary transition-colors">founder@debo.life</a>
              <p className="text-xs font-medium text-muted-foreground">Research collaboration and strategic feedback.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="px-6 py-24 bg-primary/5 border-t-2 border-primary/10">
        <div className="mx-auto max-w-2xl text-center space-y-8">
          <h2 className="text-4xl font-heading font-extrabold tracking-tight text-foreground">
            Join the Intelligence Lab.
          </h2>
          <p className="text-base font-medium leading-relaxed text-muted-foreground">
            Help us define the next decade of collaborative human-AI 
            intelligence.
          </p>
          <div className="flex justify-center">
            <Link href="/#waitlist" className="minimal-btn-primary px-10 py-4 text-sm inline-flex items-center gap-2">
              Join Waitlist
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-border/10 bg-background px-6 py-16">
        <div className="mx-auto max-w-4xl flex flex-col md:flex-row justify-between items-center gap-8">
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
              <Link href="/pitch" className="hover:text-primary transition-colors">Vision</Link>
              <Link href="/about" className="text-primary">Lab</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}

function FlowCard({ step, title, desc }: { step: string, title: string, desc: string }) {
  return (
    <div className="duo-card p-8 space-y-4">
      <div className="text-3xl font-heading font-extrabold text-primary/10">{step}</div>
      <h4 className="text-lg font-bold text-foreground tracking-tight">{title}</h4>
      <p className="text-xs font-medium text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function ProtocolItem({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <li className="flex gap-4">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 mt-0.5">
        <div className="size-1 bg-primary/40 rounded-full" />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-sm font-bold text-foreground leading-none">{title}</h4>
        <p className="text-xs font-medium text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </li>
  );
}
