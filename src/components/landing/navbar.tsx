import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

import { Badge } from "@/components/ui/badge";

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full bg-background/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 font-bold tracking-tight text-xl text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <span className="text-xs">D</span>
          </div>
          <span>Debo</span>
        </Link>
        <nav className="flex items-center space-x-6">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/join">
                <Button variant="outline" className="rounded-full px-6 font-bold hover:bg-primary hover:text-primary-foreground transition-all">
                    Sign In
                </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
