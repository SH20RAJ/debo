import Link from "next/link";
import { waitlistUrl } from "@/lib/launch";

export function FinalCTA() {
  return (
    <section className="py-32 md:py-40 px-6 bg-landing-surface border-t border-landing-border-light">
      <div className="mx-auto max-w-2xl text-center space-y-10">
        <h2 className="font-heading text-landing-3xl md:text-landing-4xl font-semibold tracking-tight text-landing-text-primary">
          Build your memory today.
        </h2>
        <p className="text-landing-lg md:text-landing-xl font-medium text-landing-text-secondary leading-relaxed">
          Join 10,000+ founders and researchers building their life&apos;s context layer. Private by default. Sovereign by design.
        </p>
        <div className="pt-2">
          <Link
            href={waitlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-landing-accent px-8 text-landing-sm font-semibold text-white transition-all hover:bg-landing-accent-hover hover:-translate-y-0.5 shadow-sm hover:shadow-md"
          >
            Get Started
          </Link>
          <p className="mt-5 text-landing-xs font-medium text-landing-text-tertiary">
            No credit card required. No data training. No compromise.
          </p>
        </div>
      </div>
    </section>
  );
}
