import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="py-24 md:py-32 lg:py-40">
      <div className="container mx-auto max-w-6xl px-6 text-center">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Not a journaling app. Not a chatbot.</p>
        <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
          Debo: your life intelligence system.
        </h1>
        <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
          Turn scattered notes into a connected memory you can ask and learn from.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/join" aria-label="Start free - Build my life graph">
            <Button size="lg" className="rounded-full w-full sm:w-auto text-base px-8 h-12">
              Start free — Build my life graph
            </Button>
          </Link>
          <Link href="#demo" aria-label="Try the demo - Ask a question">
            <Button size="lg" variant="outline" className="rounded-full w-full sm:w-auto text-base px-8 h-12">
              Try the demo &mdash; Ask &quot;When was I happiest?&quot;
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Built from your data. You own it. We never sell it.</p>
      </div>
    </section>
  );
}
