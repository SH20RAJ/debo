import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-background/80 supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md">
          <span className="font-bold sm:inline-block">Debo</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/features" className="text-sm font-medium transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md">
            Features
          </Link>
          <Link href="/privacy" className="text-sm font-medium transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md">
            Privacy
          </Link>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/login" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Sign up</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
