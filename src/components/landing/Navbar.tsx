import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { waitlistUrl } from "@/lib/launch";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary transition-all group-hover:scale-105">
              <span className="font-heading font-bold text-lg leading-none">d</span>
            </div>
            <span className="font-heading font-semibold text-xl tracking-tight text-foreground">debo</span>
          </Link>
        </div>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
          <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link href="/#use-cases" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Use cases
          </Link>
          <Link href="/#privacy" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Privacy
          </Link>
        </nav>
        <div className="flex items-center gap-4 sm:gap-6">
          <ThemeToggle />
          <div className="flex items-center gap-6">
            <Link
              href="/#launch"
              className="hidden md:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-tight"
            >
              Public preview
            </Link>
            <Link
              href={waitlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="minimal-btn-primary px-5 py-2 text-sm"
            >
              Join waitlist
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
