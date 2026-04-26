import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full max-w-7xl mx-auto px-6 py-20 border-t/50">
      <div className="flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="space-y-4">
            <span className="text-2xl font-extrabold tracking-tight">Debo</span>
            <p className="text-sm text-muted-foreground/60 max-w-xs font-medium">
                The memory OS for thinkers. <br />
                Built for privacy, speed, and intelligence.
            </p>
        </div>
        <div className="flex gap-12">
            <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Platform</h4>
                <ul className="space-y-2 text-sm font-medium text-muted-foreground">
                    <li className="hover:text-foreground cursor-pointer transition-colors">Privacy</li>
                    <li className="hover:text-foreground cursor-pointer transition-colors">Security</li>
                </ul>
            </div>
            <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Connect</h4>
                <ul className="space-y-2 text-sm font-medium text-muted-foreground">
                    <li className="hover:text-foreground cursor-pointer transition-colors">Twitter</li>
                    <li className="hover:text-foreground cursor-pointer transition-colors">GitHub</li>
                </ul>
            </div>
        </div>
      </div>
      <div className="mt-20 pt-8 border-t/50 flex flex-col md:flex-row justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/20">
        <span>© 2026 DEBO INTELLIGENCE</span>
        <span>Distributed Memory Architecture</span>
      </div>
    </footer>
  );
}
