import Link from "next/link";
import { waitlistUrl } from "@/lib/launch";

export function Footer() {
  return (
    <footer className="py-12 border-t border-border/10 bg-background">
      <div className="container mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <div className="size-6 rounded-sm bg-primary/10 flex items-center justify-center font-heading font-bold text-primary text-xs">d</div>
          <p className="text-xs font-semibold text-muted-foreground tracking-tight">
            © {new Date().getFullYear()} Debo.
          </p>
        </div>
        
        <div className="flex items-center gap-8 text-[11px] font-semibold text-muted-foreground/60 tracking-tight">
          <Link href={waitlistUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors uppercase tracking-wider">Waitlist</Link>
          <Link href="/foundation" className="hover:text-foreground transition-colors uppercase tracking-wider">Foundation</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors uppercase tracking-wider">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors uppercase tracking-wider">Terms</Link>
        </div>

        <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground/20">Memory Engine</p>
      </div>
    </footer>
  );
}
