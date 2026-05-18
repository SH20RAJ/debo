import { Metadata } from "next";
import Link from "next/link";
import {
  Droplets,
  Waves,
  GraduationCap,
  Hospital,
  Heart,
  Eye,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Globe
} from "lucide-react";

export const metadata: Metadata = {
  title: "Debo Foundation | Philanthropy & Vision",
  description: "Debo's vision for a better world: building wells, cleaning rivers, and creating schools and hospitals with full transparency.",
};

export default function FoundationPage() {
  return (
    <div className="relative overflow-hidden bg-landing-bg min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto max-w-[1120px] px-6">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-landing-border bg-landing-surface px-4 py-1.5 text-landing-xs font-semibold uppercase tracking-wider text-landing-text-secondary shadow-sm">
              <Heart className="h-4 w-4 text-landing-accent" />
              Debo for Good
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-landing-hero font-heading font-semibold text-landing-text-primary leading-[1.1]">
              Our Vision for a <br />
              <span className="text-landing-accent">Better World.</span>
            </h1>
            <p className="text-landing-lg md:text-landing-xl font-medium text-landing-text-secondary leading-relaxed">
              We believe that technology should serve humanity. Our mission extends beyond bits and bytes into the physical world.
            </p>
            <div className="flex justify-center pt-4">
              <Link 
                href="https://dodo.pe/debo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-landing-accent px-8 text-landing-sm font-semibold text-white transition-all hover:bg-landing-accent-hover hover:-translate-y-0.5 shadow-sm hover:shadow-md gap-2"
              >
                Support the Vision
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Pillars */}
      <section className="py-24 border-t border-landing-border bg-landing-surface">
        <div className="container mx-auto max-w-[1120px] px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <PillarCard 
              title="Pure Water"
              description="Building sustainable deep-bore wells to provide clean, safe drinking water to remote communities."
              icon={<Droplets className="h-6 w-6 text-landing-text-primary" />}
            />
            <PillarCard 
              title="River Restoration"
              description="Implementing modern filtration and cleanup initiatives to revitalize local river ecosystems."
              icon={<Waves className="h-6 w-6 text-landing-text-primary" />}
            />
            <PillarCard 
              title="Future Schools"
              description="Creating tech-enabled learning centers to empower the next generation of thinkers and doers."
              icon={<GraduationCap className="h-6 w-6 text-landing-text-primary" />}
            />
            <PillarCard 
              title="Health Centers"
              description="Establishing primary health facilities to ensure quality medical care is accessible to all."
              icon={<Hospital className="h-6 w-6 text-landing-text-primary" />}
            />
          </div>
        </div>
      </section>

      {/* Transparency Section */}
      <section className="py-24 border-t border-landing-border bg-landing-bg">
        <div className="container mx-auto max-w-[1120px] px-6">
          <div className="p-8 md:p-16 border border-landing-border rounded-[24px] bg-landing-surface overflow-hidden relative group shadow-sm hover:shadow-md transition-shadow">
            <div className="relative z-10 max-w-2xl space-y-8 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-xl bg-landing-bg border border-landing-border px-3 py-1 text-landing-xs font-semibold uppercase tracking-wider text-landing-text-secondary">
                <Eye className="h-3 w-3 text-landing-accent" />
                Radical Transparency
              </div>
              <h2 className="text-3xl md:text-5xl font-heading font-semibold text-landing-text-primary leading-tight">
                Every bit matters. <br />
                <span className="text-landing-accent">Fully documented.</span>
              </h2>
              <p className="text-landing-lg md:text-landing-xl font-medium text-landing-text-secondary leading-relaxed">
                We believe in complete transparency. Every dollar spent, every brick laid, and every well dug is documented and shared openly with our community.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <ImpactItem icon={<ShieldCheck className="h-5 w-5 text-landing-accent" />} text="Live Impact Tracking" />
                <ImpactItem icon={<Globe className="h-5 w-5 text-landing-accent" />} text="Open Source Philanthropy" />
                <ImpactItem icon={<Sparkles className="h-5 w-5 text-landing-accent" />} text="No Admin Fees" />
              </div>

              <div className="pt-8">
                <Link 
                  href="https://dodo.pe/debo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-landing-accent px-8 text-landing-sm font-semibold text-white transition-all hover:bg-landing-accent-hover hover:-translate-y-0.5 shadow-sm hover:shadow-md gap-2"
                >
                  Support our Foundation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Quote */}
      <section className="py-24 border-t border-landing-border bg-landing-surface">
        <div className="container mx-auto max-w-3xl px-6 text-center">
          <div className="relative">
            <blockquote className="text-2xl md:text-3xl font-heading font-semibold italic text-landing-text-primary leading-relaxed">
              &quot;The measure of a life is not in its duration, but in its donation. Debo is our commitment to leaving the world a little better than we found it.&quot;
            </blockquote>
          </div>
        </div>
      </section>
    </div>
  );
}

function PillarCard({ 
  title, 
  description, 
  icon, 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
}) {
  return (
    <div className="p-8 border border-landing-border rounded-[20px] bg-landing-surface flex flex-col items-center text-center group shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <div className="p-5 rounded-2xl bg-landing-bg border border-landing-border mb-6 transition-transform group-hover:scale-110 shadow-sm">
        {icon}
      </div>
      <h3 className="text-landing-xl font-heading font-semibold mb-3 text-landing-text-primary">{title}</h3>
      <p className="text-landing-base font-medium text-landing-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function ImpactItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-landing-sm font-bold text-landing-text-primary uppercase tracking-wider">
      <div>{icon}</div>
      <span>{text}</span>
    </div>
  );
}
