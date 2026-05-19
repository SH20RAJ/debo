import Link from "next/link";
import { waitlistUrl } from "@/lib/launch";

export function FinalCTA() {
  return (
    <section className="py-32 md:py-40 px-6 bg-landing-surface border-t border-landing-border-light">
      <div className="mx-auto max-w-2xl text-center space-y-10">
        <h2 className="font-heading font-size-landing-3xl md:text-landing-4xl font-semibold tracking-tight text-landing-text-primary">
          Start building your private memory layer.
        </h2>
        <p className="text-landing-lg md:text-landing-xl font-medium text-landing-text-secondary leading-relaxed">
          Get early access when Debo opens private beta. Capture anything. Ask your past. Trust every answer because Debo shows the source.
        </p>
        <div className="pt-2">
          <Link
            href={waitlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-landing-accent px-8 text-landing-sm font-semibold text-white transition-all hover:bg-landing-accent-hover hover:-translate-y-0.5 shadow-sm hover:shadow-md"
          >
            Join waitlist
          </Link>
          <p className="mt-5 text-landing-xs font-medium text-landing-text-tertiary">
            No spam. No selling your data. Just Debo updates.
          </p>
        </div>
      </div>
    </section>
  );
}
