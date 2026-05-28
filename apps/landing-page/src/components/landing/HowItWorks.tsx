import {
  Mic,
  Sparkles,
  Search,
  CheckSquare,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Step = {
  num: string;
  title: string;
  text: string;
  icon: LucideIcon;
  examples: string[];
};

const STEPS: Step[] = [
  {
    num: "01",
    title: "Capture",
    icon: Mic,
    text: "Drop in voice notes, journals, links, files, chats, and meetings. Debo takes any input you throw at it.",
    examples: ["Voice", "Journal", "Files", "Links", "Email"],
  },
  {
    num: "02",
    title: "Extract",
    icon: Sparkles,
    text: "Debo pulls people, dates, tasks, promises, decisions, and topics from each capture, automatically.",
    examples: ["People", "Tasks", "Decisions", "Dates"],
  },
  {
    num: "03",
    title: "Ask",
    icon: Search,
    text: "Search your past in plain English. Every answer cites the exact note, file, or transcript it came from.",
    examples: ["Cited answers", "Semantic recall"],
  },
  {
    num: "04",
    title: "Act",
    icon: CheckSquare,
    text: "Approve extracted tasks, follow up on promises, and close loops Debo surfaces from your memory.",
    examples: ["Tasks", "Follow-ups", "Reminders"],
  },
  {
    num: "05",
    title: "Control",
    icon: ShieldCheck,
    text: "Review, edit, export, or delete anything. Your memory, your rules — no training, no sharing.",
    examples: ["Export", "Delete", "Audit log"],
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 md:py-32 px-6 bg-landing-bg overflow-hidden"
    >
      {/* Subtle grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--landing-text-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--landing-text-primary) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-[1180px]">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-landing-border bg-landing-surface text-landing-xs font-medium text-landing-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-landing-text-primary" />
            How it works
          </div>
          <h2 className="font-heading text-landing-3xl md:text-landing-4xl font-semibold tracking-tight text-landing-text-primary">
            Capture once.
            <br className="md:hidden" />
            <span className="text-landing-text-tertiary"> Recall forever.</span>
          </h2>
          <p className="text-landing-base md:text-landing-lg text-landing-text-secondary max-w-2xl mx-auto leading-relaxed">
            Five steps from raw thought to source-backed answer — every one of
            them under your control.
          </p>
        </div>

        {/* Steps grid */}
        <div className="relative">
          {/* Horizontal connector — desktop only */}
          <div
            aria-hidden
            className="hidden lg:block absolute top-[42px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-landing-border to-transparent"
          />

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.num}
                  className="group relative flex flex-col items-start gap-5 rounded-2xl border border-landing-border-light bg-landing-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-landing-border hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.12)]"
                >
                  {/* Step number bubble */}
                  <div className="relative">
                    <div className="flex items-center justify-center w-[68px] h-[68px] rounded-2xl bg-landing-bg border border-landing-border-light transition-colors group-hover:border-landing-text-primary/20">
                      <Icon
                        className="w-7 h-7 text-landing-text-primary"
                        strokeWidth={1.6}
                      />
                    </div>
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-landing-text-primary text-landing-bg text-[11px] font-bold tracking-wider">
                      {step.num}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="space-y-2.5 flex-1">
                    <h3 className="text-landing-xl font-semibold text-landing-text-primary leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-landing-sm md:text-landing-base text-landing-text-secondary leading-relaxed">
                      {step.text}
                    </p>
                  </div>

                  {/* Example chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {step.examples.map((ex) => (
                      <span
                        key={ex}
                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-landing-bg border border-landing-border-light text-[11px] font-medium text-landing-text-tertiary"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>

                  {/* Index marker for screen readers / extra structure */}
                  <span className="sr-only">Step {i + 1} of {STEPS.length}</span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Footer caption */}
        <p className="mt-16 md:mt-20 text-center text-landing-sm text-landing-text-tertiary">
          Works with voice, text, files, mail, and connectors — same flow for
          everything you save.
        </p>
      </div>
    </section>
  );
}
