import Link from "next/link";
import { Button } from "@/components/ui/button";

type NavbarProps = {
  isSignedIn?: boolean;
};

export function Navbar({ isSignedIn = false }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight">Debo</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-4">
          {isSignedIn ? (
            <Button asChild className="rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90">
              <Link href="/dashboard">Enter Debo</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden md:inline-flex">
                <Link href="/join">Sign In</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/join">Get Started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
