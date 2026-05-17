import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/10 py-12 px-6 bg-background">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-medium text-muted-foreground">
        <div>Debo &copy; {new Date().getFullYear()}</div>
        <div className="flex flex-wrap gap-6 justify-center">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <a href="https://github.com/sh20raj/debo" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
          <a href="mailto:contact@debo.life" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
