import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t-2 border-border/20 bg-background py-8 px-6">
      <div className="container mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-xs font-bold text-muted-foreground/50">
          &copy; 2026 Debo
        </p>
        <div className="flex items-center gap-5">
          <Link
            href="/about"
            className="text-xs font-bold text-muted-foreground/50 transition-colors hover:text-foreground"
          >
            About
          </Link>
          <Link
            href="/pitch"
            className="text-xs font-bold text-muted-foreground/50 transition-colors hover:text-foreground"
          >
            Pitch
          </Link>
          <Link
            href="/privacy"
            className="text-xs font-bold text-muted-foreground/50 transition-colors hover:text-foreground"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-xs font-bold text-muted-foreground/50 transition-colors hover:text-foreground"
          >
            Terms
          </Link>
          <a
            href="mailto:contact@debo.life"
            className="text-xs font-bold text-muted-foreground/50 transition-colors hover:text-foreground"
          >
            Contact
          </a>
          <a
            href="https://github.com/sh20raj/debo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-muted-foreground/50 transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
