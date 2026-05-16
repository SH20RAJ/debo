"use client";

import { Shield, Lock, EyeOff, Globe, CheckCircle2, History } from "lucide-react";

const trustMarkers = [
  {
    icon: Lock,
    title: "Encrypted everywhere",
    description: "Your memories are protected in transit and at rest. Personal context deserves infrastructure-level privacy, not marketing promises.",
  },
  {
    icon: EyeOff,
    title: "Data is never sold",
    description: "We don't sell your data to advertisers or use it to train global models. Our business is your privacy, not your attention.",
  },
  {
    icon: History,
    title: "Export or delete",
    description: "Keep ownership of your archive. Export your history or remove it when you choose, without hiding controls behind support tickets.",
  },
  {
    icon: Globe,
    title: "Open-source core",
    description: "Transparency is trust. Our memory extraction and storage logic is open-source and available for public audit on GitHub.",
  },
  {
    icon: CheckCircle2,
    title: "User-approved actions",
    description: "Debo can draft reminders or calendar events, but it never takes action on your behalf without your explicit approval.",
  },
  {
    icon: Shield,
    title: "Cited evidence",
    description: "Debo is designed to answer from your own history with source references, so you can inspect where important claims came from.",
  },
];

export function Privacy() {
  return (
    <section id="privacy" className="py-24 bg-background border-t-2 border-border/10">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="lg:w-1/3 space-y-6 text-center lg:text-left lg:sticky lg:top-32">
            <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-foreground tracking-tight leading-[1.1]">
              Private memory needs <br />
              <span className="text-primary">real control.</span>
            </h2>
            <p className="text-base text-muted-foreground font-semibold leading-relaxed">
              Debo is built for deeply personal data. The product needs to be useful because it remembers, and trustworthy because you stay in control.
            </p>
          </div>

          <div className="lg:w-2/3 grid sm:grid-cols-2 gap-5">
            {trustMarkers.map((marker, i) => (
              <div key={i} className="minimal-card flex flex-col gap-4 p-6 transition-all duration-200 hover:border-primary/30">
                <div className="w-12 h-12 rounded-2xl border-2 border-border bg-muted/30 flex items-center justify-center text-primary">
                  <marker.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-foreground tracking-tight">{marker.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed text-sm">
                  {marker.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
