import Link from "next/link";
import { waitlistUrl } from "@/lib/launch";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-heading font-bold text-xl tracking-tight text-foreground">
            debo
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Product
          </Link>
          <Link
            href="/privacy"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy
          </Link>
          <a
            href="https://github.com/sh20raj/debo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <Link
            href={waitlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Waitlist
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link
            href={waitlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center justify-center rounded-md bg-foreground px-4 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Join waitlist
          </Link>
        </div>
      </div>
    </header>
  );
}
