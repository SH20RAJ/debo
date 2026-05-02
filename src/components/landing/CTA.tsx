import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 md:py-32 bg-muted/50 border-t border-border/50">
      <div className="container mx-auto max-w-6xl px-6 text-center space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Start understanding your life today.</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Sign up in 30 seconds. No credit card required.</p>
        <div className="flex justify-center pt-4 flex-col items-center gap-3">
          <Link href="/join">
            <Button size="lg" className="rounded-full text-lg px-10 h-14">
              Start free — Create my account
            </Button>
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/privacy" className="text-sm text-muted-foreground underline">How we protect your data</Link>
            <Link href="https://github.com/SH20RAJ/debo/issues" className="text-sm text-muted-foreground underline font-medium text-primary">Help us build the future &mdash; Contribute on GitHub</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
