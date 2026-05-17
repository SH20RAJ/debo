export function UseCases() {
  const scenarios = [
    {
      title: "Founders",
      text: "Remember investor notes, customer calls, product decisions, and follow-ups.",
    },
    {
      title: "Students & researchers",
      text: "Turn lectures, papers, bookmarks, and notes into a searchable knowledge base.",
    },
    {
      title: "Creators & builders",
      text: "Save ideas, scripts, references, and experiments so nothing useful gets lost.",
    },
  ];

  return (
    <section className="py-24 px-6 bg-muted/5 border-t border-border/10">
      <div className="mx-auto max-w-5xl space-y-16">
        <h2 className="text-center font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-foreground max-w-2xl mx-auto">
          Built for people who think across too many places.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scenarios.map((s, i) => (
            <div key={i} className="p-8 border border-border/30 bg-background rounded-2xl shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-3">{s.title}</h3>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
