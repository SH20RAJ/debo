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
    <section className="py-24 md:py-32 px-6 bg-landing-surface border-t border-landing-border-light">
      <div className="mx-auto max-w-[1120px] space-y-20">
        <h2 className="text-center font-heading font-size-landing-3xl md:text-landing-4xl font-semibold tracking-tight text-landing-text-primary max-w-3xl mx-auto">
          Built for people who think across too many places.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {scenarios.map((s, i) => (
            <div key={i} className="p-8 border border-landing-border bg-landing-bg rounded-[20px]">
              <h3 className="text-landing-xl font-semibold text-landing-text-primary mb-3">{s.title}</h3>
              <p className="text-landing-base font-medium text-landing-text-secondary leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
