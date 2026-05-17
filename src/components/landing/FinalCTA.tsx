import Link from "next/link";
import { waitlistUrl } from "@/lib/launch";

export function FinalCTA() {
  return (
    <section className="py-32 px-6 bg-background border-t border-border/10">
      <div className="mx-auto max-w-2xl text-center space-y-8">
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-foreground">
          Join the private memory preview.
        </h2>
        <p className="text-lg font-medium text-muted-foreground leading-relaxed">
          Get early access when Debo opens private beta. I&apos;ll send product updates, build notes, and access invites.
        </p>
        <div>
          <Link
            href={waitlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-foreground px-8 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 shadow-sm"
          >
            Join waitlist
          </Link>
          <p className="mt-4 text-xs font-medium text-muted-foreground/60">
            No spam. No selling your data. Just Debo updates.
          </p>
        </div>
      </div>
    </section>
  );
}
