import { Metadata } from "next";
import { Scale, Gavel, UserCheck, ShieldAlert, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Guidelines for using the Debo Memory Engine.",
};

export default function TermsPage() {
  return (
    <div className="relative py-20 bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-duo-swan bg-muted px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-duo-wolf">
            <Scale className="h-4 w-4 text-duo-orange" />
            Terms & Conditions
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-duo-eel leading-[1.1]">
            Our simple <span className="text-duo-blue">ground rules.</span>
          </h1>
          <p className="mt-6 text-xl font-bold text-duo-wolf max-w-2xl mx-auto leading-relaxed">
            By using Debo, you agree to these terms. We keep them simple so you can focus on remembering your life.
          </p>
        </div>

        <div className="space-y-8">
          <TermsSection 
            number="1"
            title="Acceptance of Terms"
            icon={<UserCheck className="w-6 h-6" />}
            color="text-duo-green"
            borderColor="border-duo-feather"
          >
            By accessing and using Debo, you agree to be bound by these terms. Debo operates as a personal journaling and advanced memory enhancement tool engineered to help you remember, reflect, and grow.
          </TermsSection>

          <TermsSection 
            number="2"
            title="Your Content Rights"
            icon={<HeartHandshake className="w-6 h-6" />}
            color="text-duo-blue"
            borderColor="border-duo-macaw"
          >
            You retain absolute copyright and all other rights to the content you create. You grant Debo a limited, secure license to process this content strictly for the explicit purpose of providing the memory extraction, timeline generation, and contextual search features.
          </TermsSection>

          <TermsSection 
            number="3"
            title="Proper Platform Use"
            icon={<Gavel className="w-6 h-6" />}
            color="text-duo-red"
            borderColor="border-duo-cardinal"
          >
            You agree not to use the service for any illegal purposes or to store maliciously harmful content. The Debo memory engine is engineered for individual, personal use; any unauthorized automated harvesting or scraping is strictly prohibited.
          </TermsSection>

          <TermsSection 
            number="4"
            title="Limitation of Liability"
            icon={<ShieldAlert className="w-6 h-6" />}
            color="text-duo-orange"
            borderColor="border-duo-fox"
          >
            Debo is provided &quot;as is&quot;. While our AI strives for accuracy, it may occasionally hallucinate or generate inaccuracies. We are not legally or ethically liable for any actions or decisions you make based on AI-synthesized memories.
          </TermsSection>
        </div>

        <div className="mt-16 p-8 rounded-3xl border-2 border-duo-swan bg-muted text-center">
          <p className="text-sm font-black text-duo-wolf uppercase tracking-widest mb-2">Last Updated</p>
          <p className="text-lg font-black text-duo-eel">April 29, 2026</p>
        </div>
      </div>
    </div>
  );
}

function TermsSection({ 
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
