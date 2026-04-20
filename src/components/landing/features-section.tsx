import { Brain, CloudLightning, DatabaseZap, Lock } from "lucide-react";

const features = [
  {
    name: "AI Life Companion",
    description: "Your daily journaling feeds directly into an intelligent AI model that contextualizes your life, dreams, and goals.",
    icon: Brain,
  },
  {
    name: "130+ Integrations",
    description: "By connecting your Gmail, Calendar, and Notion securely, Debo understands not just what you felt, but what actually happened.",
    icon: DatabaseZap,
  },
  {
    name: "Bring Your Own Key",
    description: "Absolute freedom. Use our localized edge AI for free, or plug in your OpenAI, Anthropic, or Ollama endpoints securely.",
    icon: Lock,
  },
  {
    name: "Edge Performance",
    description: "Built on Cloudflare Workers and Vectorize—giving you instant RAG search no matter where you are in the world.",
    icon: CloudLightning,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="container mx-auto px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to remember…</h2>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Debo combines minimalist journaling with bleeding&#8209;edge memory systems to act as your ultimate copilot.
        </p>
      </div>
      <div className="mx-auto mt-16 max-w-5xl sm:mt-20 lg:mt-24">
        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
          {features.map((feature) => (
            <div key={feature.name} className="relative pl-16 group hover:bg-muted/50 p-6 rounded-2xl transition-colors">
              <dt className="text-base font-semibold leading-7">
                <div className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary group-hover:scale-105 transition-transform motion-reduce:transform-none">
                  <feature.icon className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                </div>
                {feature.name}
              </dt>
              <dd className="mt-2 text-base leading-7 text-muted-foreground">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
