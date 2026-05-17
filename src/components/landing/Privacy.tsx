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
    <section className="py-24 md:py-32 px-6 border-t border-landing-border-light bg-landing-surface">
      <div className="mx-auto max-w-[1120px] flex flex-col md:flex-row gap-12 md:gap-24 items-start">
        <div className="flex-1 space-y-6">
          <h2 className="font-heading text-landing-3xl md:text-landing-4xl font-semibold tracking-tight text-landing-text-primary">
            Memory is personal. Debo treats it that way.
          </h2>
          <p className="text-landing-base md:text-landing-lg font-medium leading-relaxed text-landing-text-secondary">
            Debo is designed around user control, not data lock-in. You decide what gets saved, what gets connected, and what gets deleted.
          </p>
        </div>
        <div className="flex-1 w-full bg-landing-bg p-8 rounded-[20px] border border-landing-border">
          <ul className="space-y-5">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-landing-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-landing-accent" />
                </div>
                <span className="text-landing-base font-medium text-landing-text-primary">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
