import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background text-foreground">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1">
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>
      <div className="w-full max-w-sm px-4">
        {children}
      </div>
    </div>
  );
}
