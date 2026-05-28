export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Capture",
      text: "Save voice notes, journals, chats, links, files, meetings, and tasks.",
    },
    {
      num: "02",
      title: "Extract",
      text: "Debo extracts people, dates, tasks, promises, decisions, topics, and relationships automatically.",
    },
    {
      num: "03",
      title: "Ask",
      text: "Search your memory in natural language and get source-backed answers.",
    },
    {
      num: "04",
      title: "Act",
      text: "Follow up on promises, complete tasks, and act on what Debo found for you.",
    },
    {
      num: "05",
      title: "Control",
      text: "Review, edit, export, or delete your saved memories anytime.",
    },
  ];

  return (
    <section className="py-24 md:py-32 px-6 bg-landing-bg">
      <div className="mx-auto max-w-[1120px] space-y-20">
        <h2 className="text-center font-heading font-size-landing-3xl md:text-landing-4xl font-semibold tracking-tight text-landing-text-primary">
          How Debo works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-6">
          {steps.map((s, i) => (
            <div key={i} className="space-y-4">
              <div className="text-landing-xs font-bold tracking-widest text-landing-text-tertiary">
                {s.num}
              </div>
              <h3 className="text-landing-xl font-semibold text-landing-text-primary">{s.title}</h3>
              <p className="text-landing-base font-medium text-landing-text-secondary leading-relaxed">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
