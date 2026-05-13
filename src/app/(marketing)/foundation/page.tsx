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
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Debo Foundation | Philanthropy & Vision",
  description: "Debo's vision for a better world: building wells, cleaning rivers, and creating schools and hospitals with full transparency.",
};

export default function FoundationPage() {
  return (
    <div className="relative overflow-hidden bg-background min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-duo-swan bg-muted px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-duo-wolf">
              <Heart className="h-4 w-4 text-duo-red" />
              Debo for Good
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-black text-duo-eel leading-[1.1]">
              Our Vision for a <br />
              <span className="text-duo-green">Better World.</span>
            </h1>
            <p className="text-xl md:text-2xl font-bold text-duo-wolf leading-relaxed">
              We believe that technology should serve humanity. Our mission extends beyond bits and bytes into the physical world.
            </p>
            <div className="flex justify-center pt-4">
              <Button asChild variant="default" size="lg" className="rounded-2xl px-12">
                <Link href="https://dodo.pe/debo" target="_blank" rel="noopener noreferrer">
                  Support the Vision
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Pillars */}
      <section className="py-24 border-t-2 border-duo-swan bg-muted/30">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <PillarCard 
              title="Pure Water"
              description="Building sustainable deep-bore wells to provide clean, safe drinking water to remote communities."
              icon={<Droplets className="h-8 w-8" />}
              color="text-duo-blue"
              borderColor="border-duo-macaw"
            />
            <PillarCard 
              title="River Restoration"
              description="Implementing modern filtration and cleanup initiatives to revitalize local river ecosystems."
              icon={<Waves className="h-8 w-8" />}
              color="text-duo-green"
              borderColor="border-duo-feather"
            />
            <PillarCard 
              title="Future Schools"
              description="Creating tech-enabled learning centers to empower the next generation of thinkers and doers."
              icon={<GraduationCap className="h-8 w-8" />}
              color="text-duo-orange"
              borderColor="border-duo-fox"
            />
            <PillarCard 
              title="Health Centers"
              description="Establishing primary health facilities to ensure quality medical care is accessible to all."
              icon={<Hospital className="h-8 w-8" />}
              color="text-duo-red"
              borderColor="border-duo-cardinal"
            />
          </div>
        </div>
      </section>

      {/* Transparency Section */}
      <section className="py-24 border-t-2 border-duo-swan">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="duo-card p-8 md:p-16 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110 group-hover:rotate-12">
              <Eye className="w-64 h-64 text-duo-blue" />
            </div>
            
            <div className="relative z-10 max-w-2xl space-y-8 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-xl bg-muted border-2 border-duo-swan px-3 py-1 text-xs font-black uppercase tracking-wider text-duo-blue">
                <Eye className="h-3 w-3" />
                Radical Transparency
              </div>
              <h2 className="text-3xl md:text-5xl font-heading font-black text-duo-eel leading-tight">
                Every bit matters. <br />
                <span className="text-duo-blue">Fully documented.</span>
              </h2>
              <p className="text-lg md:text-xl font-bold text-duo-wolf leading-relaxed">
                We believe in complete transparency. Every dollar spent, every brick laid, and every well dug is documented and shared openly with our community.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <ImpactItem icon={<ShieldCheck className="h-5 w-5" />} text="Live Impact Tracking" />
                <ImpactItem icon={<Globe className="h-5 w-5" />} text="Open Source Philanthropy" />
                <ImpactItem icon={<Sparkles className="h-5 w-5" />} text="No Admin Fees" />
              </div>

              <div className="pt-8">
                <Button asChild variant="default" size="lg" className="w-full sm:w-auto px-8">
                  <Link href="https://dodo.pe/debo" target="_blank" rel="noopener noreferrer">
                    Support our Foundation
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Quote */}
      <section className="py-24 border-t-2 border-duo-swan bg-background">
        <div className="container mx-auto max-w-3xl px-6 text-center">
          <div className="relative">
            <Sparkles className="absolute -top-12 -left-4 w-12 h-12 text-duo-yellow opacity-20 animate-pulse" />
            <blockquote className="text-2xl md:text-3xl font-heading font-black italic text-duo-eel leading-relaxed">
              &quot;The measure of a life is not in its duration, but in its donation. Debo is our commitment to leaving the world a little better than we found it.&quot;
            </blockquote>
            <Sparkles className="absolute -bottom-12 -right-4 w-12 h-12 text-duo-blue opacity-20 animate-pulse" />
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
  color, 
  borderColor 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  color: string; 
  borderColor: string;
}) {
  return (
    <div className="duo-card p-8 flex flex-col items-center text-center group">
      <div className={`p-5 rounded-2xl bg-background border-2 ${borderColor} ${color} mb-6 transition-transform group-hover:scale-110 group-hover:animate-wiggle shadow-[0_4px_0_rgba(0,0,0,0.05)]`}>
        {icon}
      </div>
      <h3 className="text-xl font-heading font-black mb-3 text-duo-eel">{title}</h3>
      <p className="text-base font-bold text-duo-wolf leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function ImpactItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-base font-black text-duo-eel uppercase tracking-wider">
      <div className="text-duo-blue">{icon}</div>
      <span>{text}</span>
    </div>
  );
}
