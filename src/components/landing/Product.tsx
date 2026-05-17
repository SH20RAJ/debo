import { Mic, BrainCircuit, SearchCheck, ShieldCheck } from "lucide-react";

export function Product() {
  const features = [
    {
      icon: <Mic className="w-5 h-5 text-landing-text-primary" />,
      title: "Voice + journal capture",
      text: "Record thoughts, meetings, reflections, or quick notes without changing your workflow.",
    },
    {
      icon: <BrainCircuit className="w-5 h-5 text-landing-text-primary" />,
      title: "Automatic memory extraction",
      text: "Debo detects people, dates, decisions, tasks, topics, and useful facts from your saved context.",
    },
    {
      icon: <SearchCheck className="w-5 h-5 text-landing-text-primary" />,
      title: "Source-backed recall",
      text: "Ask questions and get answers with references to the original note, chat, file, or voice transcript.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-landing-text-primary" />,
      title: "Private by default",
      text: "Your memories stay under your control. Export, delete, or disconnect sources anytime.",
    },
  ];

  return (
    <section className="py-24 md:py-32 px-6 border-t border-landing-border-light bg-landing-bg">
      <div className="mx-auto max-w-[1120px] space-y-16">
        <h2 className="text-center font-heading text-3xl md:text-4xl lg:text-[40px] font-semibold tracking-tight text-landing-text-primary">
          Capture once. Recall anytime.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {features.map((f, i) => (
            <div key={i} className="flex gap-5 p-6 rounded-2xl hover:bg-landing-surface transition-colors">
              <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-landing-surface border border-landing-border shadow-sm">
                {f.icon}
              </div>
              <div className="space-y-2.5">
                <h3 className="text-[18px] font-semibold text-landing-text-primary">{f.title}</h3>
                <p className="text-[15px] font-medium text-landing-text-secondary leading-relaxed">
                  {f.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
