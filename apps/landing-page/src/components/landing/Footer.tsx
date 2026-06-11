import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-landing-border-light py-12 px-6 bg-landing-bg">
      <div className="container mx-auto max-w-[1120px] space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-landing-sm font-medium text-landing-text-tertiary">
          <div className="flex items-center gap-4">
            <span className="font-heading font-semibold text-landing-text-primary tracking-tight">debo</span>
            <span className="hidden md:inline text-landing-text-tertiary">The context layer for human intelligence.</span>
          </div>
          <div className="flex flex-wrap gap-8 justify-center">
            <Link href="/pitch" className="hover:text-landing-text-primary transition-colors">Vision</Link>
            <Link href="/privacy" className="hover:text-landing-text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-landing-text-primary transition-colors">Terms</Link>
            <a href="https://github.com/sh20raj/debo" target="_blank" rel="noopener noreferrer" className="hover:text-landing-text-primary transition-colors">GitHub</a>
            <a href="mailto:contact@debo.life" className="hover:text-landing-text-primary transition-colors">Contact</a>
          </div>
        </div>
        <div className="text-center md:text-left text-landing-xs text-landing-text-tertiary">
          Debo &copy; {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
