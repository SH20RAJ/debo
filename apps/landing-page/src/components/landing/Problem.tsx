export function Problem() {
  const problems = [
    {
      title: "Scattered context",
      text: "Your intelligence is fragmented across 10+ apps. Voice notes, journals, and meetings are silos where data goes to die.",
    },
    {
      title: "Static AI",
      text: "ChatGPT doesn't know you. Every session starts from zero because your AI lacks a permanent memory layer.",
    },
    {
      title: "Loss of logic",
      text: "You remember the 'what', but forget the 'why'. The reasoning behind your past decisions vanishes over time.",
    },
  ];

  const unfinished = [
    "You promised Raj the Q4 budget by Friday.",
    "The reasoning behind your Q3 pivot is missing.",
    'You mentioned "landing page revamp" in three different voice notes.',
    "You have a recurring goal with no logged progress.",
  ];

  return (
    <section className="py-24 md:py-32 px-6 bg-landing-surface">
      <div className="mx-auto max-w-[1120px] space-y-20">
        <div className="text-center space-y-6">
          <h2 className="font-heading text-landing-3xl md:text-landing-4xl font-semibold tracking-tight text-landing-text-primary">
            Information is abundant. Context is extinct.
          </h2>
          <p className="mx-auto max-w-2xl text-landing-base md:text-landing-lg font-medium text-landing-text-secondary leading-relaxed">
            We generate thousands of notes, emails, and ideas every month. But without context, they are just digital noise. Debo provides the permanent memory layer that turns scattered data into sovereign intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {problems.map((p, i) => (
            <div key={i} className="p-8 border border-landing-border rounded-[20px] bg-landing-bg transition-all duration-300 hover:shadow-lg hover:shadow-black/[0.02]">
              <h3 className="text-landing-xl font-semibold text-landing-text-primary mb-3">{p.title}</h3>
              <p className="text-landing-base font-medium text-landing-text-secondary leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>

        {/* Open Loops Section */}
        <div className="text-center space-y-8">
          <h2 className="font-heading text-landing-3xl md:text-landing-4xl font-semibold tracking-tight text-landing-text-primary">
            Search your life. Close the loops.
          </h2>
          <div className="mx-auto max-w-2xl space-y-4">
            {unfinished.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-5 border border-landing-border rounded-2xl bg-landing-bg text-left transition-all duration-300 hover:shadow-md hover:shadow-black/[0.02]">
                <div className="w-2 h-2 rounded-full bg-landing-accent shrink-0"></div>
                <p className="text-landing-base font-medium text-landing-text-primary">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
