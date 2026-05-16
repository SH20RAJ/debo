import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, LockKeyhole, Sparkles } from "lucide-react";

import { LaunchCountdown } from "@/components/landing/LaunchCountdown";
import { launchDateLabel, waitlistUrl } from "@/lib/launch";

export function LaunchPreview({ label = "Debo Studio" }: { label?: string }) {
  return (
    <main className="min-h-screen overflow-hidden bg-background px-6 py-8 text-foreground">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,0.16),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.1),transparent_28%)] dark:bg-[radial-gradient(circle_at_20%_0%,rgba(96,165,250,0.22),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.14),transparent_28%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to landing
          </Link>
          <Link
            href={waitlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="minimal-btn-primary px-5 py-2 text-sm"
          >
            Join waitlist
          </Link>
        </header>

        <section className="grid flex-1 gap-12 py-16 lg:grid-cols-[1fr_380px] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary/70">
              <LockKeyhole className="h-3.5 w-3.5" />
              {label} is in private build mode
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-tight text-foreground md:text-7xl">
                Debo public preview opens on {launchDateLabel}.
              </h1>
              <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground md:text-xl">
                The full dashboard is being prepared for public preview. Join the waitlist now and we will send access when the doors open.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={waitlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="minimal-btn-primary px-8 py-3 text-base"
              >
                Join the waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/#waitlist" className="minimal-btn-outline px-8 py-3 text-base">
                See launch page
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/75 p-6 shadow-2xl shadow-primary/5 dark:bg-card/70">
            <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/50">Launch timer</div>
                <div className="mt-1 text-sm font-semibold text-foreground">Public Preview</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>

            <LaunchCountdown compact />

            <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary/70">
                <Sparkles className="h-3.5 w-3.5" />
                What opens then
              </div>
              <p className="text-sm font-medium leading-6 text-foreground/80">
                Journals, voice capture, chat memory, characters, insights, and source-cited recall in one private dashboard.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
