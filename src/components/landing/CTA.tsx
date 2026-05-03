import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield } from "lucide-react";

export function CTA() {
  return (
    <section className="relative overflow-hidden py-32 bg-background border-t border-border/50">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-500/30 blur-[100px] rounded-full mix-blend-screen" />
      </div>
      
      <div className="container relative z-10 mx-auto max-w-5xl px-6 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium tracking-wide uppercase">Unlock Your Potential</span>
        </div>

        <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent pb-2">
          Start understanding <br className="hidden md:block"/> your life today.
        </h2>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12 font-light">
          Join thousands who are journaling, reflecting, and growing. Sign up in 30 seconds. No credit card required.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center justify-center mb-16">
          <Link href="/join" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-full text-lg px-8 h-14 group transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
              Start free — Create my account
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-8 items-center border-t border-border/50 pt-8 w-full max-w-3xl">
          <Link href="/privacy" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
            <Shield className="w-4 h-4 group-hover:text-primary transition-colors" />
            <span>How we protect your data</span>
          </Link>
          <div className="w-1 h-1 rounded-full bg-border hidden sm:block" />
          <Link href="https://github.com/SH20RAJ/debo/issues" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 group-hover:text-primary transition-colors"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            <span>Help us build the future on GitHub</span>
          </Link>
        </div>

      </div>
      
      {/* Bottom subtle grid or line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
