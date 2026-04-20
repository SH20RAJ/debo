import { Brain, CloudLightning, DatabaseZap, Lock } from "lucide-react";

const features = [
  {
    name: "AI Life Companion",
    description: "Your daily journaling feeds directly into an intelligent AI model that contextualizes your life, dreams, and goals perfectly.",
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
    <section id="features" className="container mx-auto px-4 py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-2xl text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
          Everything you need to remember
        </h2>
        <p className="mt-4 text-lg text-muted-foreground text-balance">
          Debo combines extremely minimalist journaling with cutting-edge memory systems.
        </p>
      </div>
      
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {features.map((feature) => (
            <div 
              key={feature.name} 
              className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="flex items-center gap-x-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                  <feature.icon className="h-5 w-5 text-foreground" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
