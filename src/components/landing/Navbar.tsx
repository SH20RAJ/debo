import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

type NavbarProps = {
  isSignedIn?: boolean;
};

export function Navbar({ isSignedIn = false }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-duo-swan bg-background">
      <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center space-x-12">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-heading font-black text-3xl tracking-tight text-duo-feather">debo</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-black uppercase tracking-widest text-duo-wolf">
            <Link href="#features" className="hover:text-duo-eel transition-colors">Features</Link>
            <Link href="#use-cases" className="hover:text-duo-eel transition-colors">Use Cases</Link>
            <Link href="#privacy" className="hover:text-duo-eel transition-colors">Privacy</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {isSignedIn ? (
            <Link 
              href="/dashboard" 
              className="duo-btn duo-btn--primary px-6 py-3 text-sm shadow-[0_4px_0_var(--duo-feather-shadow)]"
            >
              Enter Debo
            </Link>
          ) : (
            <>
              <Link 
                href="/join" 
                className="hidden md:inline-flex font-black uppercase tracking-widest text-sm text-duo-wolf hover:text-duo-eel transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/join" 
                className="duo-btn duo-btn--primary px-6 py-3 text-sm shadow-[0_4px_0_var(--duo-feather-shadow)]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}



