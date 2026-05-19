import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-primary mb-4">Debo</h1>
      <p className="text-muted-foreground mb-8">Your personal intelligence companion</p>
      <Link
        href="/dashboard"
        className="rounded-xl bg-primary text-primary-foreground px-6 py-3 font-medium hover:brightness-105 transition-all"
      >
        Open Dashboard
      </Link>
    </div>
  );
}
