import { Button } from "@/components/ui/button";
import Link from "next/link";

type HeroProps = {
  isSignedIn?: boolean;
};

export function Hero({ isSignedIn = false }: HeroProps) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--primary-muted),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_35%)]" />
      <div className="container mx-auto max-w-6xl px-6 text-center">
        <div className="mb-8 flex justify-center">
          <Link 
            href="https://github.com/SH20RAJ/debo/issues/36" 
            className="group relative flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm transition-all hover:bg-primary/10"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            Project Jarvis is announced
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </Link>
        </div>
        <p className="text-sm uppercase tracking-[0.28em] text-primary/80">Memory, but operational.</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-tight md:text-6xl">
          Debo turns your life into something you can query, steer, and enter.
        </h1>
        <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
          Capture the day in plain language, then ask for the patterns, decisions, and moments that matter most.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {isSignedIn ? (
            <Link href="/dashboard" aria-label="Enter Debo dashboard">
              <Button size="lg" className="h-12 w-full rounded-full px-8 text-base shadow-lg shadow-primary/20 sm:w-auto">
                Enter Debo
              </Button>
            </Link>
          ) : (
            <Link href="/join" aria-label="Start free - Build my life graph">
              <Button size="lg" className="h-12 w-full rounded-full px-8 text-base shadow-lg shadow-primary/20 sm:w-auto">
                Start free — Build my life graph
              </Button>
            </Link>
          )}
          <Link href="#demo" aria-label="Try the demo - Ask a question">
            <Button size="lg" variant="outline" className="h-12 w-full rounded-full px-8 text-base sm:w-auto">
              Ask the demo: &quot;What changed me this month?&quot;
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Built from your own data. Private by default. No noisy feed, no generic assistant.
        </p>
      </div>
    </section>
  );
}
