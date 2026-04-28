import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="py-24 md:py-32 lg:py-40">
      <div className="container mx-auto max-w-6xl px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
          Everything you forget, <br className="hidden md:block" /> Debo remembers.
        </h1>
        <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
          Write once. Ask anything about your life.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/join">
            <Button size="lg" className="rounded-full w-full sm:w-auto text-base px-8 h-12">
              Get Started
            </Button>
          </Link>
          <Link href="#demo">
            <Button size="lg" variant="outline" className="rounded-full w-full sm:w-auto text-base px-8 h-12">
              Try Demo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
