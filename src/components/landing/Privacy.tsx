import { Check } from "lucide-react";

export function Privacy() {
  const points = [
    "No public memory by default",
    "Export and delete controls",
    "Source references for every answer",
    "Clear connected-app permissions",
    "No fake \"magic\" without showing where answers came from",
  ];

  return (
    <section className="py-24 px-6 border-t border-border/10 bg-background">
      <div className="mx-auto max-w-4xl flex flex-col md:flex-row gap-12 md:gap-24 items-start">
        <div className="flex-1 space-y-4">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
            Memory is personal. Debo treats it that way.
          </h2>
          <p className="text-base font-medium leading-relaxed text-muted-foreground">
            Debo is designed around user control, not data lock-in. You decide what gets saved, what gets connected, and what gets deleted.
          </p>
        </div>
        <div className="flex-1">
          <ul className="space-y-4 w-full">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-foreground/90">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
