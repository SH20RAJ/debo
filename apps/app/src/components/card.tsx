import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function Card({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border-2 border-border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-md group"
    >
      <Icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
      <h3 className="font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </Link>
  );
}
