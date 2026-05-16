import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { ProductPromises } from "@/components/landing/ProductPromises";
import { Footer } from "@/components/landing/Footer";

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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <WaitlistForm />
        <ProductPromises />
        <FinalCTA />
      </main>
      <Footer />
    </div>
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
