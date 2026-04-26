import { Card, CardContent } from "@/components/ui/card";
import { Brain, Network, Mic, Shield, History, Cpu } from "lucide-react";

const EXPERIENCES = [
  {
    title: "Second Brain",
    desc: "Write once, know forever. Debo connects your thoughts into a living network of intelligence.",
    icon: <Brain className="h-6 w-6 text-blue-500" />,
    color: "bg-blue-500/10"
  },
  {
    title: "Memory Gateway",
    desc: "Your context, anywhere. Bridge your journals into Cursor, Claude, or your local terminal.",
    icon: <Network className="h-6 w-6 text-emerald-500" />,
    color: "bg-emerald-500/10"
  },
  {
    title: "Voice Intelligence",
    desc: "Speak freely. Your AI companion listens and understands your life context in real-time.",
    icon: <Mic className="h-6 w-6 text-purple-500" />,
    color: "bg-purple-500/10"
  },
  {
    title: "Neural History",
    desc: "A chronological timeline of your growth, semantically searchable by meaning, not just words.",
    icon: <History className="h-6 w-6 text-amber-500" />,
    color: "bg-amber-500/10"
  },
  {
    title: "Private by Design",
    desc: "End-to-end encrypted intelligence. Your data is yours, encrypted on the edge.",
    icon: <Shield className="h-6 w-6 text-rose-500" />,
    color: "bg-rose-500/10"
  },
  {
    title: "130+ Connections",
    desc: "From GitHub to Google Calendar. Sync your digital life into one unified intelligence OS.",
    icon: <Cpu className="h-6 w-6 text-cyan-500" />,
    color: "bg-cyan-500/10"
  }
];

export function FeaturesSection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-24 md:py-32">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {EXPERIENCES.map((exp, i) => (
          <Card key={i} className="group border-none bg-muted/20 hover:bg-muted/40 transition-all duration-500 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1">
            <CardContent className="p-8 space-y-6">
              <div className={`p-4 ${exp.color} w-fit rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
                {exp.icon}
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold tracking-tight">{exp.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {exp.desc}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Philosophy Section */}
      <div className="mt-32 text-center max-w-3xl mx-auto space-y-8 animate-in fade-in duration-1000">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter">
            Not another app. <br />
            <span className="text-primary italic">A new paradigm.</span>
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground/60 leading-relaxed font-medium italic">
            "Debo doesn't just store data. It builds a model of your mind. It remembers what you forget—and connects what you never could."
        </p>
        <div className="pt-8 flex justify-center">
            <div className="h-px w-24 bg-border" />
        </div>
      </div>
    </section>
  );
}
