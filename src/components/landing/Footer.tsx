import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-landing-border-light py-12 px-6 bg-landing-bg">
      <div className="container mx-auto max-w-[1120px] flex flex-col md:flex-row items-center justify-between gap-6 text-[14px] font-medium text-landing-text-tertiary">
        <div>Debo &copy; {new Date().getFullYear()}</div>
        <div className="flex flex-wrap gap-8 justify-center">
          <Link href="/privacy" className="hover:text-landing-text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-landing-text-primary transition-colors">Terms</Link>
          <a href="https://github.com/sh20raj/debo" target="_blank" rel="noopener noreferrer" className="hover:text-landing-text-primary transition-colors">GitHub</a>
          <a href="mailto:contact@debo.life" className="hover:text-landing-text-primary transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
