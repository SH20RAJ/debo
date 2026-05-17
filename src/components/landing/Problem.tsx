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
    <section className="py-24 md:py-32 px-6 bg-landing-surface">
      <div className="mx-auto max-w-[1120px] space-y-20">
        <div className="text-center space-y-6">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-[40px] font-semibold tracking-tight text-landing-text-primary">
            Your context is scattered everywhere.
          </h2>
          <p className="mx-auto max-w-2xl text-[16px] md:text-[18px] font-medium text-landing-text-secondary leading-relaxed">
            Important thoughts live across voice notes, screenshots, meetings, browser tabs, journals, chats, and tasks. Normal AI tools only know the current conversation. Debo remembers the context you choose to save.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {problems.map((p, i) => (
            <div key={i} className="p-8 border border-landing-border rounded-[20px] bg-landing-bg transition-all duration-300 hover:shadow-lg hover:shadow-black/[0.02]">
              <h3 className="text-[18px] font-semibold text-landing-text-primary mb-3">{p.title}</h3>
              <p className="text-[15px] font-medium text-landing-text-secondary leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
