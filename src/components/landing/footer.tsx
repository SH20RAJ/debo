import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container mx-auto px-4 pb-8 pt-16 sm:pt-24 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <span className="text-2xl font-bold tracking-tight">Debo</span>
            <p className="text-sm leading-6 text-muted-foreground max-w-xs">
              The AI Companion that Remembers. Built for privacy, speed, and infinite context.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/features" className="text-sm leading-6 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/integrations" className="text-sm leading-6 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md">
                      Integrations
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/privacy" className="text-sm leading-6 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-sm leading-6 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-muted-foreground">&copy; 2026 Debo Contributors. MIT Licensed.</p>
        </div>
      </div>
    </footer>
  );
}
