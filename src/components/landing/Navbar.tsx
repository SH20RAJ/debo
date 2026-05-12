import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

type NavbarProps = {
  isSignedIn?: boolean;
};

export function Navbar({ isSignedIn = false }: NavbarProps) {
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
        <div className="flex items-center gap-6">
          <ThemeToggle />
          {isSignedIn ? (
            <Link 
              href="/dashboard" 
              className="minimal-btn-primary px-5 py-2 text-sm"
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-6">
              <Link 
                href="/join" 
                className="hidden md:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-tight"
              >
                Sign In
              </Link>
              <Link 
                href="/join" 
                className="minimal-btn-primary px-5 py-2 text-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}



