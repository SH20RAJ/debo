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
  Globe,
  Clock3
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Debo Foundation | Philanthropy & Vision",
  description: "Debo's vision for a better world: building wells, cleaning rivers, and creating schools and hospitals with full transparency.",
};

export default function FoundationPage() {
  return (
    <div className="relative isolate">
      {/* Background decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pb-32 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8">
            <Heart className="h-4 w-4" />
            <span>Debo for Good</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Our Vision for a <br />
            <span className="text-muted-foreground/40 font-medium italic">Better World.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We believe that technology should serve humanity. Our mission extends beyond bits and bytes into the physical world, bringing essential resources to those who need them most.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="https://dodo.pe/debo" target="_blank" rel="noopener noreferrer">
                Support the Vision
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Vision Pillars */}
        <div className="mx-auto mt-24 max-w-2xl sm:mt-32 lg:mt-40 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            <div className="flex flex-col">
              <dt className="text-base font-semibold leading-7 text-foreground">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Droplets className="h-6 w-6" />
                </div>
                Pure Water
              </dt>
              <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                <p className="flex-auto">Building sustainable deep-bore wells to provide clean, safe drinking water to remote communities.</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-base font-semibold leading-7 text-foreground">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Waves className="h-6 w-6" />
                </div>
                River Restoration
              </dt>
              <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                <p className="flex-auto">Implementing modern filtration and cleanup initiatives to revitalize local river ecosystems.</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-base font-semibold leading-7 text-foreground">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <GraduationCap className="h-6 w-6" />
                </div>
                Future Schools
              </dt>
              <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                <p className="flex-auto">Creating tech-enabled learning centers to empower the next generation of thinkers and doers.</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-base font-semibold leading-7 text-foreground">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Hospital className="h-6 w-6" />
                </div>
                Health Centers
              </dt>
              <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                <p className="flex-auto">Establishing primary health facilities to ensure quality medical care is accessible to all.</p>
              </dd>
            </div>
          </dl>
        </div>

        {/* Transparency Section */}
        <div className="mt-32 rounded-3xl bg-muted/30 border border-border p-8 sm:p-16 lg:mt-48">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-lg bg-background border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
                <Eye className="h-3 w-3" />
                Radical Transparency
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Every bit matters. <br />
                <span className="text-primary">Fully documented.</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We believe in complete transparency. Every dollar spent, every brick laid, and every well dug is documented and shared openly with our community.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Live Impact Tracking
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Globe className="h-4 w-4 text-primary" />
                  Open Source Philanthropy
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  No Admin Fees
                </div>
              </div>
            </div>
            <div className="mt-10 flex flex-col items-start gap-4 lg:mt-0 lg:flex-shrink-0">
              <Button asChild variant="outline" size="lg" className="rounded-xl border-primary/20 hover:bg-primary/5">
                <Link href="https://dodo.pe/debo" target="_blank" rel="noopener noreferrer">
                  Support our Foundation
                </Link>
              </Button>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                <Clock3 className="h-3 w-3" />
                Transparency Portal Coming Soon
              </div>
            </div>
          </div>
        </div>

        {/* Philosophy Quote */}
        <div className="mx-auto mt-32 max-w-2xl text-center lg:mt-48">
          <figure className="relative">
            <svg
              className="absolute left-0 top-0 -translate-x-12 -translate-y-8 h-24 w-24 fill-primary/5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.154c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <blockquote className="text-xl font-medium italic leading-9 text-foreground sm:text-2xl">
              <p>
                &quot;The measure of a life is not in its duration, but in its donation. Debo is our commitment to leaving the world a little better than we found it.&quot;
              </p>
            </blockquote>
          </figure>
        </div>
      </div>

      {/* Footer decoration */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-primary opacity-10 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
      </div>
    </div>
  );
}
