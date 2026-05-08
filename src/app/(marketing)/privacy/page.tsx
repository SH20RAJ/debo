import { Metadata } from "next";
import { Shield, Lock, Eye, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How we handle your data and memory engine privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="relative py-20 bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-duo-swan bg-muted px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-duo-wolf">
            <Shield className="h-4 w-4 text-duo-blue" />
            Privacy First
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-duo-eel leading-[1.1]">
            Your memories are <span className="text-duo-green">safe with us.</span>
          </h1>
          <p className="mt-6 text-xl font-bold text-duo-wolf max-w-2xl mx-auto leading-relaxed">
            We built Debo to be your private memory engine. Your data is never sold, and your thoughts remain entirely yours.
          </p>
        </div>

        <div className="space-y-8">
          <PrivacySection 
            number="1"
            title="Data Sovereignty"
            icon={<Lock className="w-6 h-6" />}
            color="text-duo-green"
            borderColor="border-duo-feather"
          >
            Debo is built on the principle of personal memory sovereignty. Your journals, reflections, and extracted memories are yours. We do not sell your data or use it to train global models that could compromise your privacy. Our architecture ensures your thoughts remain entirely under your control.
          </PrivacySection>

          <PrivacySection 
            number="2"
            title="Memory Extraction"
            icon={<BrainIcon className="w-6 h-6" />}
            color="text-duo-blue"
            borderColor="border-duo-macaw"
          >
            When you journal, our engine extracts key facts and patterns to build your personal memory database. This process is strictly isolated to your user account and uses secure, encrypted storage. No other user or entity can query or access your extracted memory graph.
          </PrivacySection>

          <PrivacySection 
            number="3"
            title="AI Processing"
            icon={<Eye className="w-6 h-6" />}
            color="text-duo-orange"
            borderColor="border-duo-fox"
          >
            We use advanced Edge AI and specialized models to provide personal insights. These requests are processed seamlessly in real-time. Critically, your prompts and personal data are not retained by underlying model providers to improve their global services beyond the immediate scope of generating your private insights.
          </PrivacySection>

          <PrivacySection 
            number="4"
            title="Security Practices"
            icon={<CheckCircle2 className="w-6 h-6" />}
            color="text-duo-purple"
            borderColor="border-duo-beetle"
          >
            We implement industry-standard security measures to protect your data. This includes robust encryption in transit and at rest, secure database connections, and stringent access controls to ensure only you have access to your timeline and memory vaults.
          </PrivacySection>
        </div>

        <div className="mt-16 p-8 rounded-3xl border-2 border-duo-swan bg-muted text-center">
          <p className="text-sm font-black text-duo-wolf uppercase tracking-widest mb-2">Last Updated</p>
          <p className="text-lg font-black text-duo-eel">April 29, 2026</p>
        </div>
      </div>
    </div>
  );
}

function PrivacySection({ 
  number, 
  title, 
  icon, 
  children,
  color,
  borderColor
}: { 
  number: string; 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  color: string;
  borderColor: string;
}) {
  return (
    <div className="duo-card">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <div className={`w-14 h-14 rounded-2xl border-2 ${borderColor} ${color} bg-background flex items-center justify-center font-heading font-black text-xl`}>
            {icon}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-black uppercase tracking-widest ${color}`}>Section {number}</span>
            <div className="h-px flex-1 bg-duo-swan" />
          </div>
          <h2 className="text-2xl font-heading font-black text-duo-eel">{title}</h2>
          <div className="text-lg font-bold text-duo-wolf leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z"/>
    </svg>
  );
}

