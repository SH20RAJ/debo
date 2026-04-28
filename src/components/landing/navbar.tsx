import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl tracking-tight">Debo</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/join">
            <Button variant="ghost" className="hidden md:inline-flex">
              Sign In
            </Button>
          </Link>
          <Link href="/join">
            <Button className="rounded-full">Get Started</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
