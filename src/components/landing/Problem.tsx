export function Problem() {
  const problems = [
    {
      title: "Notes disappear",
      text: "Voice notes, ideas, and screenshots pile up but rarely become useful later.",
    },
    {
      title: "AI forgets context",
      text: "Every new chat starts from zero unless you explain everything again.",
    },
    {
      title: "Search is broken",
      text: "You remember the idea, but not where you saved it.",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-5xl space-y-16">
        <div className="text-center space-y-4">
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Your context is scattered everywhere.
          </h2>
          <p className="mx-auto max-w-2xl text-base font-medium text-muted-foreground leading-relaxed">
            Important thoughts live across voice notes, screenshots, meetings, browser tabs, journals, chats, and tasks. Normal AI tools only know the current conversation. Debo remembers the context you choose to save.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {problems.map((p, i) => (
            <div key={i} className="p-8 border border-border/50 rounded-2xl bg-muted/10">
              <h3 className="text-lg font-bold font-heading text-foreground mb-3">{p.title}</h3>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
