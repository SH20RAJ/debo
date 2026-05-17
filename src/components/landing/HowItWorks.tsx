export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Capture",
      text: "Save voice notes, journals, chats, links, files, meetings, and tasks.",
    },
    {
      num: "02",
      title: "Organize",
      text: "Debo extracts entities, dates, topics, decisions, and relationships automatically.",
    },
    {
      num: "03",
      title: "Ask",
      text: "Search your memory in natural language and get source-backed answers.",
    },
    {
      num: "04",
      title: "Control",
      text: "Review, edit, export, or delete your saved memories anytime.",
    },
  ];

  return (
    <section className="py-24 px-6 bg-background">
      <div className="mx-auto max-w-4xl space-y-16">
        <h2 className="text-center font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          How Debo works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="space-y-4">
              <div className="text-xs font-bold tracking-widest text-muted-foreground/60">
                {s.num}
              </div>
              <h3 className="text-base font-bold text-foreground">{s.title}</h3>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
