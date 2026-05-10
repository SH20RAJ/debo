import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, 
  Brain, 
  Mic2, 
  Database, 
  Zap, 
  Heart, 
  ShieldCheck,
  Bot
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debo Pitch — The Future of Memory",
  description: "Debo is your personal intelligence layer. A Jarvis-like companion for your life documentary.",
};

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-duo-snow font-body text-duo-eel overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-duo-macaw bg-duo-macaw/10 px-4 py-2 text-sm font-black uppercase tracking-wider text-duo-macaw">
                <Sparkles className="h-4 w-4" />
                Project Jarvis: Live Intelligence
              </div>
              <h1 className="font-display text-5xl font-black leading-[1.1] tracking-tight text-duo-eel sm:text-7xl">
                your second brain, <span className="text-duo-feather">always listening.</span>
              </h1>
              <p className="max-w-xl text-xl font-bold leading-relaxed text-duo-wolf">
                Debo is a calm, personal intelligence layer for your life. It remembers every journal, connects every pattern, and talks back in real-time.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/join" className="duo-btn--primary duo-btn h-16 px-10 text-lg shadow-[0_6px_0_var(--duo-feather-shadow)]">
                  Start Your Journey
                </Link>
                <Link href="#vision" className="duo-btn--secondary duo-btn h-16 px-10 text-lg shadow-[0_6px_0_var(--duo-swan)]">
                  Read the Pitch
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square relative flex items-center justify-center">
                {/* Visual Representation of Debo */}
                <div className="absolute inset-0 bg-duo-feather/5 rounded-full animate-pulse scale-110" />
                <div className="absolute inset-0 bg-duo-feather/10 rounded-full animate-pulse delay-75" />
                <div className="relative h-64 w-64 lg:h-80 lg:w-80 rounded-[3.5rem] bg-white border-4 border-duo-feather shadow-[0_12px_0_var(--duo-feather-shadow)] flex items-center justify-center">
                   <Image src="/mascot.png" alt="Duo" width={200} height={200} className="object-contain" />
                </div>
                
                {/* Floating Tags */}
                <div className="absolute top-0 right-0 animate-bounce">
                   <div className="duo-badge bg-duo-bee shadow-[0_4px_0_var(--duo-bee-shadow)] text-duo-eel py-3 px-6 text-sm">
                      <Mic2 className="h-4 w-4" /> Voice Capture
                   </div>
                </div>
                <div className="absolute bottom-10 left-0 animate-bounce delay-150">
                   <div className="duo-badge bg-duo-macaw shadow-[0_4px_0_var(--duo-macaw-shadow)] text-white py-3 px-6 text-sm">
                      <Database className="h-4 w-4" /> 100% Private
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section id="vision" className="bg-duo-polar px-6 py-24">
        <div className="mx-auto max-w-4xl text-center space-y-12">
          <h2 className="font-display text-4xl font-black text-duo-eel sm:text-5xl">
            the cognitive <span className="text-duo-cardinal">overload.</span>
          </h2>
          <p className="text-2xl font-bold leading-relaxed text-duo-wolf">
            We capture more data than ever, but we remember less. Our journals are graveyards of thoughts, and our memories are fading silos.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
             {[
               { icon: Brain, label: "Fading Memory", color: "text-duo-cardinal" },
               { icon: Zap, label: "Fragmented Data", color: "text-duo-fox" },
               { icon: Database, label: "Lost Insights", color: "text-duo-beetle" }
             ].map((item, i) => (
               <div key={i} className="rounded-3xl border-2 border-duo-swan bg-white p-8 shadow-[0_4px_0_var(--duo-swan)]">
                  <item.icon className={`h-10 w-10 mx-auto mb-4 ${item.color}`} />
                  <span className="font-black uppercase tracking-wider text-sm">{item.label}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* The Solution: Debo */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
           <div className="text-center mb-20 space-y-4">
              <h2 className="font-display text-4xl font-black sm:text-6xl text-duo-eel">
                meet <span className="text-duo-feather">debo.</span>
              </h2>
              <p className="text-xl font-bold text-duo-wolf">Your personal intelligence layer.</p>
           </div>

           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard 
                icon={Mic2}
                title="Jarvis Voice"
                description="Ambient, real-time voice intelligence. Talk to your past, plan your future, and reflect on your day."
                color="bg-duo-green"
              />
              <FeatureCard 
                icon={Database}
                title="Memory Palace"
                description="Structured extraction of atomic facts. Debo remembers your preferences, commitments, and key life events."
                color="bg-duo-blue"
              />
              <FeatureCard 
                icon={Brain}
                title="Pattern Engine"
                description="Graph-based analysis that identifies emotional trends, recurring themes, and growth areas over time."
                color="bg-duo-purple"
              />
              <FeatureCard 
                icon={ShieldCheck}
                title="Privacy First"
                description="Your life data stays yours. Encrypted, private, and grounded only in your own historical evidence."
                color="bg-duo-orange"
              />
              <FeatureCard 
                icon={Zap}
                title="Omni-Input"
                description="Import from ChatGPT, Claude, or journals. Voice, video, and image support for multimodal capture."
                color="bg-duo-macaw"
              />
              <FeatureCard 
                icon={Bot}
                title="MCP Ready"
                description="Connect Debo to your favorite AI tools like Cursor or Claude Desktop via Model Context Protocol."
                color="bg-duo-eel"
              />
           </div>
        </div>
      </section>

      {/* Voice Demo Section */}
      <section className="bg-duo-feather px-6 py-24 text-white">
         <div className="mx-auto max-w-5xl text-center space-y-12">
            <h2 className="font-display text-4xl font-black sm:text-6xl leading-tight">
               sub-100ms latency. <br/>feels like <span className="text-duo-mask">magic.</span>
            </h2>
            <div className="relative mx-auto h-64 w-64 sm:h-80 sm:w-80">
               <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
               <div className="relative h-full w-full rounded-full border-8 border-white bg-white/10 backdrop-blur-xl flex flex-col items-center justify-center gap-4">
                  <Mic2 className="h-20 w-20" />
                  <div className="flex gap-1 h-8">
                     {[...Array(5)].map((_, i) => (
                       <div key={i} className="w-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />
                     ))}
                  </div>
               </div>
            </div>
            <p className="text-2xl font-bold opacity-90 italic">
               &quot;Debo, what did I learn about focus last Tuesday?&quot;
            </p>
         </div>
      </section>

      {/* Vision Pillars */}
      <section className="px-6 py-24 bg-duo-snow">
         <div className="mx-auto max-w-7xl">
            <div className="grid gap-16 lg:grid-cols-2">
               <div className="space-y-12">
                  <h3 className="font-display text-4xl font-black text-duo-eel">the four pillars of debo.</h3>
                  <div className="space-y-8">
                     <Pillar icon={Zap} title="Expressive" text="Simple, direct, and active language. We keep it brief and focused." />
                     <Pillar icon={Sparkles} title="Playful" text="Creative energy that turns journaling into a game you want to win." />
                     <Pillar icon={Heart} title="Embracing" text="Your life&apos;s #1 cheerleader. supportive, inclusive, and always in your corner." />
                     <Pillar icon={ShieldCheck} title="Worldly" text="Broad perspectives that connect your personal growth to the wider world." />
                  </div>
               </div>
               <div className="rounded-[3rem] border-4 border-duo-swan bg-white p-12 shadow-[0_12px_0_var(--duo-swan)] flex flex-col justify-between">
                  <div className="space-y-6">
                     <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-duo-macaw/10 text-duo-macaw">
                        <ShieldCheck className="h-8 w-8" />
                     </div>
                     <h4 className="text-3xl font-black text-duo-eel leading-tight">Your data is your property.</h4>
                     <p className="text-xl font-bold text-duo-wolf leading-relaxed">
                        We don&apos;t sell insights. We don&apos;t train on your life. Debo is a private instance, grounded only in what you tell it.
                     </p>
                  </div>
                  <Link href="/join" className="duo-btn--info duo-btn h-16 w-full mt-12 text-lg shadow-[0_6px_0_var(--duo-macaw-shadow)] uppercase tracking-widest">
                     Claim Your Palace
                  </Link>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-duo-swan bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl flex flex-col items-center gap-8">
           <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-duo-feather-shadow bg-duo-feather text-sm font-black text-white shadow-[0_3px_0_var(--duo-feather-shadow)]">
                D
              </span>
              <span className="font-display text-xl font-black tracking-tight text-duo-feather">
                debo
              </span>
           </div>
           <p className="text-sm font-bold text-duo-wolf">© 2026 Debo. Built for the persistent.</p>
           <div className="flex gap-8 text-sm font-black uppercase tracking-widest text-duo-swan">
              <Link href="/privacy" className="hover:text-duo-wolf transition">Privacy</Link>
              <Link href="/terms" className="hover:text-duo-wolf transition">Terms</Link>
              <Link href="/pitch" className="text-duo-feather">Pitch</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon: Icon, title, description, color }: FeatureCardProps) {
  return (
    <div className="rounded-[2.5rem] border-2 border-duo-swan bg-white p-8 transition-all hover:-translate-y-2 shadow-[0_8px_0_var(--duo-swan)]">
       <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${color} text-white shadow-[0_4px_0_rgba(0,0,0,0.1)]`}>
          <Icon className="h-7 w-7" />
       </div>
       <h3 className="mb-3 text-xl font-black text-duo-eel">{title}</h3>
       <p className="font-bold leading-relaxed text-duo-wolf text-sm">
          {description}
       </p>
    </div>
  );
}

interface PillarProps {
  icon: React.ElementType;
  title: string;
  text: string;
}

function Pillar({ icon: Icon, title, text }: PillarProps) {
  return (
    <div className="flex gap-6">
       <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-duo-feather/10 text-duo-feather">
          <Icon className="h-6 w-6" />
       </div>
       <div className="space-y-1">
          <h4 className="text-lg font-black text-duo-eel">{title}</h4>
          <p className="font-bold text-duo-wolf leading-snug">{text}</p>
       </div>
    </div>
  );
}
