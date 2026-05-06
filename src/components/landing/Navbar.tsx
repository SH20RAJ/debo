import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

type NavbarProps = {
  isSignedIn?: boolean;
};

export function Navbar({ isSignedIn = false }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-duo-swan bg-background">
      <div className="container mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-heading font-black text-3xl tracking-tight text-duo-green">debo</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-4">
          <ThemeToggle />
          {isSignedIn ? (
            <Button asChild variant="duolingo" size="sm">
              <Link href="/dashboard">Enter Debo</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden md:inline-flex text-duo-wolf font-bold hover:bg-duo-polar">
                <Link href="/join">Sign In</Link>
              </Button>
              <Button asChild variant="duolingo" size="sm">
                <Link href="/join">Get Started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

