"use client";

import { Shield, Lock, Trash2, Download, EyeOff, Globe, CheckCircle2, History } from "lucide-react";

const trustMarkers = [
  {
    icon: Lock,
    title: "Encrypted everywhere",
    description: "Your memories are encrypted in transit and at rest using industry-standard AES-256. Only you hold the keys to your life story.",
  },
  {
    icon: EyeOff,
    title: "Data is never sold",
    description: "We don't sell your data to advertisers or use it to train global models. Our business is your privacy, not your attention.",
  },
  {
    icon: History,
    title: "Export or Delete",
    description: "Download your entire history in open formats (Markdown/JSON) or permanently delete everything with one click. No lock-in.",
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
    description: "Every answer Debo gives is backed by a cited source from your own history. No hallucinations, just recovered memories.",
  },
];

export function Privacy() {
  return (
    <section id="privacy" className="py-32 bg-background border-t border-border/10">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="flex flex-col lg:flex-row gap-20 items-start">
          <div className="lg:w-1/3 space-y-8 text-center lg:text-left lg:sticky lg:top-32">
            <h2 className="text-4xl md:text-5xl font-heading font-semibold text-foreground tracking-tight leading-[1.1]">
              Trust is the <br />
              <span className="text-primary/60 italic">core engine.</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              We architected Debo for deeply personal data. No vague claims—just specific, technical commitments to your privacy.
            </p>
          </div>
          
          <div className="lg:w-2/3 grid sm:grid-cols-2 gap-6">
            {trustMarkers.map((marker, i) => (
              <div key={i} className="minimal-card flex flex-col gap-5 p-8 transition-all duration-300 hover:border-primary/20 hover:shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-primary/60">
                  <marker.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground tracking-tight">{marker.title}</h3>
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
