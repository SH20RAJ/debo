import { ArrowRight, ShieldCheck } from "lucide-react";
import { waitlistUrl } from "@/lib/launch";

export function WaitlistForm() {
  return (
    <section id="waitlist" className="py-20 px-6">
      <div className="mx-auto max-w-xl">
        <div className="duo-card p-8 md:p-10 text-center space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/10">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-primary/70">
              Early access
            </div>
            <h2 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
              Reserve your spot
            </h2>
            <p className="text-sm font-medium text-muted-foreground">
              Be first in line when Debo opens for private preview.
            </p>
          </div>

          <a
            href={waitlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="minimal-btn-primary w-full py-3 text-sm inline-flex items-center justify-center gap-2"
          >
            Join the waitlist
            <ArrowRight className="h-4 w-4" />
          </a>

          <p className="text-[11px] font-semibold text-muted-foreground/50 leading-relaxed">
            No spam. No selling your data. You&apos;ll only hear about Debo
            access and product updates.
          </p>
        </div>
      </div>
    </section>
  );
}
