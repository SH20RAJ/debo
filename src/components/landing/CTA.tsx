import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 md:py-32 bg-muted/50 border-t border-border/50">
      <div className="container mx-auto max-w-6xl px-6 text-center space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Start your second brain</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Stop losing your thoughts. Join Debo today and gain infinite memory.
        </p>
        <div className="flex justify-center pt-4">
          <Link href="/join">
            <Button size="lg" className="rounded-full text-lg px-10 h-14">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
