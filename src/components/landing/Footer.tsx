import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-10 border-t border-border bg-background">
      <div className="container mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Debo. All rights reserved.
        </p>
        <p className="text-xs italic tracking-[0.2em] uppercase opacity-50">hope to be human</p>
        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          <Link href="/foundation" className="hover:text-foreground transition-colors">Foundation</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
