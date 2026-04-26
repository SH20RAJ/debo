import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full bg-background/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 font-bold tracking-tight text-xl text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-transparent overflow-hidden">
            <Image 
                src="/logo.png" 
                alt="Debo Logo" 
                width={32} 
                height={32} 
                className="object-contain"
            />
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
