import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 border-t-2 border-duo-swan bg-background">
      <div className="container mx-auto max-w-5xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm font-black text-duo-wolf">
          © {new Date().getFullYear()} DEBO. ALL RIGHTS RESERVED.
        </p>
        <p className="text-xs font-black tracking-[0.2em] uppercase text-duo-swan">hope to be human</p>
        <div className="flex items-center space-x-8 text-sm font-black text-duo-wolf">
          <Link href="/foundation" className="hover:text-duo-eel transition-colors">FOUNDATION</Link>
          <Link href="/privacy" className="hover:text-duo-eel transition-colors">PRIVACY</Link>
          <Link href="/terms" className="hover:text-duo-eel transition-colors">TERMS</Link>
        </div>
      </div>
    </footer>
  );
}

