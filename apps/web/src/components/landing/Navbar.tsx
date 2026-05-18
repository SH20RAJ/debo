import Link from "next/link";
import { waitlistUrl } from "@/lib/launch";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-landing-border bg-landing-surface/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-[1120px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-heading font-semibold text-landing-lg tracking-tight text-landing-text-primary">
            debo
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-landing-sm font-medium text-landing-text-secondary transition-colors hover:text-landing-text-primary"
          >
            Product
          </Link>
          <Link
            href="/privacy"
            className="text-landing-sm font-medium text-landing-text-secondary transition-colors hover:text-landing-text-primary"
          >
            Privacy
          </Link>
          <a
            href="https://github.com/sh20raj/debo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-landing-sm font-medium text-landing-text-secondary transition-colors hover:text-landing-text-primary"
          >
            GitHub
          </a>
          <Link
            href={waitlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-landing-sm font-medium text-landing-text-secondary transition-colors hover:text-landing-text-primary"
          >
            Waitlist
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link
            href={waitlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-landing-text-primary px-4 text-landing-xs font-medium text-landing-surface transition-all hover:bg-black hover:-translate-y-[1px] shadow-sm"
          >
            Join waitlist
          </Link>
        </div>
      </div>
    </header>
  );
}
