import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, LockKeyhole, Sparkles } from "lucide-react";

import { LaunchCountdown } from "@/components/landing/LaunchCountdown";
import { launchDateLabel, waitlistUrl } from "@/lib/launch";

export function LaunchPreview({ label = "Debo Studio" }: { label?: string }) {
  return (
    <main className="min-h-screen overflow-hidden bg-background px-6 py-8 text-foreground">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_20%_0%,rgba(88,204,2,0.12),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(88,204,2,0.08),transparent_28%)] dark:bg-[radial-gradient(circle_at_20%_0%,rgba(88,204,2,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(88,204,2,0.1),transparent_28%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to landing
          </Link>
          <Link
            href={waitlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="minimal-btn-primary px-5 py-2 text-xs"
          >
            Join waitlist
          </Link>
        </header>

        <section className="grid flex-1 gap-10 py-12 lg:grid-cols-[1fr_380px] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-primary">
              <LockKeyhole className="h-3.5 w-3.5" />
              {label} is in private build mode
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Debo public preview opens on {launchDateLabel}.
              </h1>
              <p className="max-w-2xl text-base font-semibold leading-relaxed text-muted-foreground md:text-lg">
                The full dashboard is being prepared for public preview. Join the waitlist now and we will send access when the doors open.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={waitlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="minimal-btn-primary px-7 py-2.5 text-sm"
              >
                Join the waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/#waitlist" className="minimal-btn-outline px-7 py-2.5 text-sm">
                See launch page
              </Link>
            </div>
          </div>

          <div className="duo-card p-5">
            <div className="mb-5 flex items-center justify-between border-b border-border/50 pb-4">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/50">Launch timer</div>
                <div className="mt-1 text-sm font-bold text-foreground">Public Preview</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary/20 bg-primary/5 text-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>

            <LaunchCountdown compact />

            <div className="mt-5 rounded-2xl border-2 border-primary/20 bg-primary/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                What opens then
              </div>
              <p className="text-sm font-semibold leading-6 text-foreground/80">
                Journals, voice capture, chat memory, characters, insights, and source-cited recall in one private dashboard.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
