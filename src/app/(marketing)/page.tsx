import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { ComparisonDemo } from "@/components/landing/ComparisonDemo";
import { FeaturesShowcase } from "@/components/landing/FeaturesShowcase";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { ProductPromises } from "@/components/landing/ProductPromises";

export const metadata: Metadata = {
  title: "Debo — Private AI Memory Waitlist",
  description:
    "Join the Debo waitlist. Debo turns voice notes, journals, chats, people, promises, and decisions into a private searchable memory graph with cited AI answers.",
  openGraph: {
    title: "Debo — Private AI Memory",
    description:
      "Join the private preview for Debo, an AI memory app for voice notes, journals, chats, people, decisions, and cited recall.",
  },
};

export default function LandingPage() {
  return (
      <main className="flex-1">
        <Hero />
        <ComparisonDemo />
        <FeaturesShowcase />
        <WaitlistForm />
        <ProductPromises />
        <HowItWorks />
        <FinalCTA />
      </main>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Ingest",
      text: "Feed Debo anything — voice notes, research papers, chat logs, or complex data. Our multimodal engine extracts latent meaning automatically.",
    },
    {
      num: "02",
      title: "Tinker",
      text: "Train your personal memory graph. Use researcher-grade controls to fine-tune how context is weighted and connected across domains.",
    },
    {
      num: "03",
      title: "Think",
      text: "Collaborate with your intelligence. Get cited answers and deep insights sourced from your own private knowledge base.",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-4xl space-y-12">
        <div className="text-center space-y-3">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-primary/70">
            How it works
          </div>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Collaborative Intelligence. <span className="text-primary">Personal Research.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.num} className="duo-card p-6 space-y-3">
              <div className="text-3xl font-heading font-extrabold text-primary/20">
                {s.num}
              </div>
              <h3 className="font-heading text-lg font-extrabold tracking-tight text-foreground">
                {s.title}
              </h3>
              <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-2xl text-center space-y-6">
        <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          Join the private memory preview.
        </h2>
        <p className="text-base font-medium leading-relaxed text-muted-foreground">
          Be among the first users to test Debo&apos;s memory dashboard, voice
          capture, people profiles, and cited recall.
        </p>
        <a
          href="#waitlist"
          className="minimal-btn-primary px-8 py-3 text-sm inline-flex items-center gap-2"
        >
          Join waitlist
        </a>
      </div>
    </section>
  );
}
