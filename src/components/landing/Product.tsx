import { Mic, BrainCircuit, SearchCheck, ShieldCheck } from "lucide-react";

export function Product() {
  const features = [
    {
      icon: <Mic className="w-5 h-5 text-foreground" />,
      title: "Voice + journal capture",
      text: "Record thoughts, meetings, reflections, or quick notes without changing your workflow.",
    },
    {
      icon: <BrainCircuit className="w-5 h-5 text-foreground" />,
      title: "Automatic memory extraction",
      text: "Debo detects people, dates, decisions, tasks, topics, and useful facts from your saved context.",
    },
    {
      icon: <SearchCheck className="w-5 h-5 text-foreground" />,
      title: "Source-backed recall",
      text: "Ask questions and get answers with references to the original note, chat, file, or voice transcript.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-foreground" />,
      title: "Private by default",
      text: "Your memories stay under your control. Export, delete, or disconnect sources anytime.",
    },
  ];

  return (
    <section className="py-24 px-6 border-t border-border/10 bg-background">
      <div className="mx-auto max-w-5xl space-y-16">
        <h2 className="text-center font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Capture once. Recall anytime.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <div key={i} className="flex gap-4 p-6 rounded-2xl hover:bg-muted/10 transition-colors">
              <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-muted/30 border border-border/50">
                {f.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
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
