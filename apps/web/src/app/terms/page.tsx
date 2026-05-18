import { Metadata } from "next";
import { Scale, Gavel, UserCheck, ShieldAlert, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Guidelines for using the Debo Memory Engine.",
};

export default function TermsPage() {
  return (
    <div className="relative py-24 md:py-32 bg-landing-bg min-h-screen">
      <div className="mx-auto max-w-[800px] px-6 lg:px-8">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-landing-border bg-landing-surface px-4 py-1.5 text-landing-xs font-semibold uppercase tracking-wider text-landing-text-secondary shadow-sm">
            <Scale className="h-4 w-4 text-landing-accent" />
            Terms & Conditions
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-semibold text-landing-text-primary leading-[1.1]">
            Our simple <span className="text-landing-accent">ground rules.</span>
          </h1>
          <p className="mt-6 text-landing-lg font-medium text-landing-text-secondary max-w-2xl mx-auto leading-relaxed">
            By using Debo, you agree to these terms. We keep them simple so you can focus on remembering your life.
          </p>
        </div>

        <div className="space-y-8">
          <TermsSection 
            number="1"
            title="Acceptance of Terms"
            icon={<UserCheck className="w-5 h-5 text-landing-text-primary" />}
          >
            By accessing and using Debo, you agree to be bound by these terms. Debo operates as a personal journaling and advanced memory enhancement tool engineered to help you remember, reflect, and grow.
          </TermsSection>

          <TermsSection 
            number="2"
            title="Your Content Rights"
            icon={<HeartHandshake className="w-5 h-5 text-landing-text-primary" />}
          >
            You retain absolute copyright and all other rights to the content you create. You grant Debo a limited, secure license to process this content strictly for the explicit purpose of providing the memory extraction, timeline generation, and contextual search features.
          </TermsSection>

          <TermsSection 
            number="3"
            title="Proper Platform Use"
            icon={<Gavel className="w-5 h-5 text-landing-text-primary" />}
          >
            You agree not to use the service for any illegal purposes or to store maliciously harmful content. The Debo memory engine is engineered for individual, personal use; any unauthorized automated harvesting or scraping is strictly prohibited.
          </TermsSection>

          <TermsSection 
            number="4"
            title="Limitation of Liability"
            icon={<ShieldAlert className="w-5 h-5 text-landing-text-primary" />}
          >
            Debo is provided &quot;as is&quot;. While our AI strives for accuracy, it may occasionally hallucinate or generate inaccuracies. We are not legally or ethically liable for any actions or decisions you make based on AI-synthesized memories.
          </TermsSection>
        </div>

        <div className="mt-16 p-8 rounded-[20px] border border-landing-border bg-landing-surface text-center shadow-sm">
          <p className="text-landing-xs font-bold text-landing-text-tertiary uppercase tracking-widest mb-2">Last Updated</p>
          <p className="text-landing-base font-semibold text-landing-text-primary">April 29, 2026</p>
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
}: { 
  number: string; 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
}) {
  return (
    <div className="p-8 border border-landing-border rounded-[20px] bg-landing-surface shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-xl border border-landing-border bg-landing-bg flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <span className="text-landing-xs font-bold uppercase tracking-widest text-landing-text-tertiary">Section {number}</span>
            <div className="h-px flex-1 bg-landing-border-light" />
          </div>
          <h2 className="text-landing-xl font-heading font-semibold text-landing-text-primary">{title}</h2>
          <div className="text-landing-base font-medium text-landing-text-secondary leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
