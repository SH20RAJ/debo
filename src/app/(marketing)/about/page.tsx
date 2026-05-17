import Link from "next/link";
import {
  Brain,
  Shield,
  Zap,
  Terminal,
  ArrowRight,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debo — The Lab",
  description: "Building the collaborative layer between human and artificial minds.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-landing-bg text-landing-text-primary font-sans selection:bg-landing-accent/20">
      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-24 overflow-hidden">
        <div className="mx-auto max-w-[800px] relative z-10">
          <div className="space-y-8 text-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-landing-border bg-landing-surface text-landing-accent font-semibold tracking-wider text-landing-xs uppercase shadow-sm">
              <span className="size-1.5 rounded-full bg-landing-accent animate-pulse" />
              The Intelligence Lab
            </div>
            <h1 className="font-size-landing-3xl md:text-landing-4xl lg:text-landing-hero font-heading font-semibold tracking-tight leading-[1.05] text-landing-text-primary">
              Documenting <br />
              <span className="text-landing-accent">Human Growth.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-landing-lg font-medium leading-relaxed text-landing-text-secondary">
              Debo is a multimodal intelligence lab dedicated to the personal
              experience. We build systems that help you retain, connect,
              and synthesize your life documentary.
            </p>
          </div>
        </div>
      </section>

      {/* The Mission */}
      <section className="px-6 py-24 border-t border-landing-border-light bg-landing-surface">
        <div className="mx-auto max-w-[800px]">
          <div className="grid gap-16 md:grid-cols-2 items-start">
            <div className="space-y-6">
              <h2 className="text-landing-2xl font-heading font-semibold tracking-tight text-landing-text-primary">
                Collaborative Intelligence
              </h2>
              <p className="text-landing-base font-medium leading-relaxed text-landing-text-secondary">
                We believe your digital memory should be more than a graveyard
                of files. Debo uses multimodal research protocols to turn your
                voice, journals, and cross-app data into a living, private
                memory graph that grows with you.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-landing-border bg-landing-bg text-landing-text-primary shadow-sm">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-landing-sm font-bold text-landing-text-primary">Grounded in Evidence</h4>
                  <p className="text-landing-xs font-medium text-landing-text-tertiary">Answers cited directly from your own life.</p>
                </div>
              </div>
            </div>
            <div className="p-8 border border-landing-border bg-landing-bg rounded-[20px] space-y-6 shadow-sm">
              <h3 className="text-landing-lg font-bold text-landing-text-primary tracking-tight">The Lab Protocol</h3>
              <ul className="space-y-4">
                <ProtocolItem
                  title="Multimodal Ingestion"
                  desc="Processing voice, papers, and complex data into a unified graph."
                />
                <ProtocolItem
                  title="Personal Tinker"
                  desc="Researcher-grade control over your personal model fine-tuning."
                />
                <ProtocolItem
                  title="Latent Connectionism"
                  desc="Discovering hidden relationship manifolds across your history."
                />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Design Philosophy */}
      <section className="px-6 py-24 border-t border-landing-border-light bg-landing-bg">
        <div className="mx-auto max-w-[800px]">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div className="p-10 bg-landing-surface border border-landing-border rounded-[24px] space-y-6 order-2 lg:order-1 shadow-sm">
              <h3 className="text-landing-xl font-heading font-semibold tracking-tight text-landing-text-primary">Editorial Calm.</h3>
              <p className="text-landing-sm font-medium leading-relaxed text-landing-text-secondary">
                Our design system is built on the principle of Editorial Calm.
                Inspired by high-end magazines and industrial design, we use
                generous whitespace, bold typography, and subtle micro-interactions
                to create an environment that encourages deep focus and reflection.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full border border-landing-border text-landing-xs font-semibold uppercase tracking-wider text-landing-text-tertiary">Typography First</span>
                <span className="px-3 py-1 rounded-full border border-landing-border text-landing-xs font-semibold uppercase tracking-wider text-landing-text-tertiary">Minimal UI</span>
              </div>
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <div className="text-landing-xs font-bold uppercase tracking-widest text-landing-accent">Philosophy</div>
              <h2 className="font-size-landing-3xl font-heading font-semibold tracking-tight text-landing-text-primary">Aesthetics for <br /><span className="text-landing-accent">Cognition.</span></h2>
              <p className="text-landing-base font-medium leading-relaxed text-landing-text-secondary">
                We believe that the beauty of a system directly impacts the
                clarity of the thoughts processed within it. Debo is not just
                a tool; it is a space for the mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Multimodal Flow */}
      <section className="px-6 py-24 bg-landing-surface border-t border-landing-border-light">
        <div className="mx-auto max-w-[800px] space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-size-landing-3xl font-heading font-semibold tracking-tight text-landing-text-primary">The Data Documentary.</h2>
            <p className="mx-auto max-w-xl text-landing-base font-medium text-landing-text-secondary leading-relaxed">
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
      <section className="px-6 py-24 bg-landing-bg border-t border-landing-border-light">
        <div className="mx-auto max-w-[800px] text-center space-y-12">
          <h2 className="font-size-landing-3xl font-heading font-semibold tracking-tight text-landing-text-primary">Reach out.</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="p-10 border border-landing-border bg-landing-surface rounded-[24px] space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-landing-xs font-bold uppercase tracking-widest text-landing-accent">Lab Operations</div>
              <a href="mailto:contact@debo.life" className="text-landing-xl font-bold text-landing-text-primary hover:text-landing-accent transition-colors">contact@debo.life</a>
              <p className="text-landing-xs font-medium text-landing-text-tertiary">General inquiries, press, and partnerships.</p>
            </div>
            <div className="p-10 border border-landing-border bg-landing-surface rounded-[24px] space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-landing-xs font-bold uppercase tracking-widest text-landing-accent">Direct Line</div>
              <a href="mailto:founder@debo.life" className="text-landing-xl font-bold text-landing-text-primary hover:text-landing-accent transition-colors">founder@debo.life</a>
              <p className="text-landing-xs font-medium text-landing-text-tertiary">Research collaboration and strategic feedback.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="px-6 py-24 bg-landing-surface border-t border-landing-border-light">
        <div className="mx-auto max-w-2xl text-center space-y-8">
          <h2 className="font-size-landing-3xl font-heading font-semibold tracking-tight text-landing-text-primary">
            Join the Intelligence Lab.
          </h2>
          <p className="text-landing-base font-medium leading-relaxed text-landing-text-secondary">
            Help us define the next decade of collaborative human-AI
            intelligence.
          </p>
          <div className="flex justify-center">
            <Link href="/#waitlist" className="inline-flex h-12 items-center justify-center rounded-xl bg-landing-accent px-8 text-landing-sm font-semibold text-white transition-all hover:bg-landing-accent-hover hover:-translate-y-0.5 shadow-sm hover:shadow-md gap-2">
              Join Waitlist
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FlowCard({ step, title, desc }: { step: string, title: string, desc: string }) {
  return (
    <div className="p-8 border border-landing-border bg-landing-surface rounded-[20px] space-y-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <div className="font-size-landing-3xl font-heading font-bold text-landing-accent/20">{step}</div>
      <h4 className="text-landing-lg font-bold text-landing-text-primary tracking-tight">{title}</h4>
      <p className="text-landing-xs font-medium text-landing-text-secondary leading-relaxed">{desc}</p>
    </div>
  );
}

function ProtocolItem({ title, desc }: { title: string, desc: string }) {
  return (
    <li className="flex gap-4">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-landing-accent/30 mt-0.5 bg-landing-accent/5">
        <div className="size-1 bg-landing-accent rounded-full animate-pulse" />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-landing-sm font-bold text-landing-text-primary leading-none">{title}</h4>
        <p className="text-landing-xs font-medium text-landing-text-secondary leading-relaxed">{desc}</p>
      </div>
    </li>
  );
}
