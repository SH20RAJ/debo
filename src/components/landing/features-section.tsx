import { Card, CardContent } from "@/components/ui/card";
import { Brain, Search, Sparkles, Shield, BookOpen, Fingerprint } from "lucide-react";

const FEATURES = [
  {
    title: "The Ask Engine",
    desc: "A dedicated search interface that understands your life context. Ask anything about your past and get immediate, synthesized answers.",
    icon: <Search className="h-6 w-6 text-primary" />,
    color: "bg-primary/5"
  },
  {
    title: "High-Retention Journaling",
    desc: "A distraction-free writing environment designed to help you capture thoughts with clarity and depth. Pure markdown support.",
    icon: <BookOpen className="h-6 w-6 text-emerald-500" />,
    color: "bg-emerald-500/5"
  },
  {
    title: "Neural Fact Extraction",
    desc: "Debo automatically extracts key facts, names, and patterns from your entries, building a persistent memory of who you are.",
    icon: <Fingerprint className="h-6 w-6 text-purple-500" />,
    color: "bg-purple-500/5"
  },
  {
    title: "Daily Life Insights",
    desc: "Discover trends in your productivity, mood, and focus. Debo reveals the patterns in your life that you might otherwise miss.",
    icon: <Sparkles className="h-6 w-6 text-amber-500" />,
    color: "bg-amber-500/5"
  },
  {
    title: "Your Second Brain",
    desc: "Not just storage, but intelligence. Debo connects your past entries to provide a deep, semantic understanding of your life journey.",
    icon: <Brain className="h-6 w-6 text-blue-500" />,
    color: "bg-blue-500/5"
  },
  {
    title: "Private Intelligence",
    desc: "Your memories are sacred. Debo is built with privacy-first architecture, ensuring your personal data stays yours.",
    icon: <Shield className="h-6 w-6 text-rose-500" />,
    color: "bg-rose-500/5"
  }
];

export function FeaturesSection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-24 md:py-40">
      <div className="text-center mb-20 space-y-4">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter">Everything you need <br className="hidden md:block" /> to remember your life.</h2>
        <p className="text-xl text-muted-foreground/60 font-medium max-w-2xl mx-auto">Focused tools for personal growth and memory preservation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {FEATURES.map((feature, i) => (
          <Card key={i} className="group border-none bg-muted/20 hover:bg-muted/30 transition-all duration-500 rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-10 space-y-8">
              <div className={`p-5 ${feature.color} w-fit rounded-3xl group-hover:scale-110 transition-transform duration-500`}>
                {feature.icon}
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground/80 leading-relaxed font-medium text-lg">
                  {feature.desc}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Manifest Section */}
      <div className="mt-40 text-center max-w-4xl mx-auto p-12 md:p-24 rounded-[4rem] bg-primary text-primary-foreground space-y-10 shadow-2xl shadow-primary/20">
        <h2 className="text-4xl md:text-7xl font-extrabold tracking-tighter leading-none">
            Stop losing <br /> your life to time.
        </h2>
        <p className="text-xl md:text-3xl text-primary-foreground/70 leading-relaxed font-medium">
            "We forget 80% of what we experience within 24 hours. Debo is the antidote to the vanishing self."
        </p>
        <div className="pt-6">
            <div className="h-1.5 w-32 bg-primary-foreground/20 mx-auto rounded-full" />
        </div>
      </div>
    </section>
  );
}
