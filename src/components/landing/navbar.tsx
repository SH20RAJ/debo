import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

import { Badge } from "@/components/ui/badge";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 font-bold tracking-tight text-foreground">
          Debo
          <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 h-4 leading-none rounded-full">
            Beta
          </Badge>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/features" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <div className="flex items-center gap-2 border-l border-border pl-4">
            <ThemeToggle />
            <Button size="sm" asChild>
              <Link href="/join">Get Started</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
