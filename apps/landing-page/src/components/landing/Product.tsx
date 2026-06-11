import { Mic, BrainCircuit, SearchCheck, ShieldCheck } from "lucide-react";

export function Product() {
  const features = [
    {
      icon: <Mic className="w-5 h-5 text-landing-text-primary" />,
      title: "Omniscient capture",
      text: "Ingest journals, voice notes, PDFs, and conversations into one unified stream. Debo takes any input you throw at it.",
    },
    {
      icon: <BrainCircuit className="w-5 h-5 text-landing-text-primary" />,
      title: "Context synthesis",
      text: "Debo automatically extracts people, projects, and decisions to build your personal knowledge graph.",
    },
    {
      icon: <SearchCheck className="w-5 h-5 text-landing-text-primary" />,
      title: "Semantic retrieval",
      text: "Ask questions in plain English. Every answer is grounded in your own history and cites the exact source.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-landing-text-primary" />,
      title: "Sovereign intelligence",
      text: "Your memory is local-first, end-to-end encrypted, and yours to keep. No ads. No public training. No data selling.",
    },
  ];

  return (
    <section className="py-24 md:py-32 px-6 border-t border-landing-border-light bg-landing-bg">
      <div className="mx-auto max-w-[1120px] space-y-16">
        <h2 className="text-center font-heading text-landing-3xl md:text-landing-4xl font-semibold tracking-tight text-landing-text-primary">
          Infrastructure for your past.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {features.map((f, i) => (
            <div key={i} className="flex gap-5 p-6 rounded-2xl hover:bg-landing-surface transition-colors">
              <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-landing-surface border border-landing-border shadow-sm">
                {f.icon}
              </div>
              <div className="space-y-2.5">
                <h3 className="text-landing-xl font-semibold text-landing-text-primary">{f.title}</h3>
                <p className="text-landing-base font-medium text-landing-text-secondary leading-relaxed">
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
