import Link from "next/link";
import { waitlistUrl } from "@/lib/launch";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border/30 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:scale-105">
            <span className="font-heading font-extrabold text-lg leading-none">
              d
            </span>
          </div>
          <span className="font-heading font-extrabold text-lg tracking-tight text-foreground">
            debo
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          <Link
            href="/privacy"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <Link
            href={waitlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="minimal-btn-primary px-4 py-1.5 text-xs"
          >
            Join waitlist
          </Link>
        </nav>
      </div>
    </header>
  );
}
