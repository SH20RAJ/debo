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
    <section id="privacy" className="py-24 bg-background border-t-2 border-duo-swan">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/3 space-y-8 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-heading font-black text-duo-eel leading-tight">
              Trust is the <br />
              <span className="text-duo-macaw italic">core engine.</span>
            </h2>
            <p className="text-xl text-duo-wolf font-bold leading-relaxed">
              We architected Debo for deeply personal data. No vague claims—just specific, technical commitments to your privacy.
            </p>
          </div>
          
          <div className="lg:w-2/3 grid sm:grid-cols-2 gap-8">
            {trustMarkers.map((marker, i) => (
              <div key={i} className="duo-card p-8 flex flex-col gap-4 shadow-[0_4px_0_var(--duo-swan)] transition-all hover:translate-y-[-4px]">
                <div className="w-14 h-14 rounded-2xl bg-duo-polar border-2 border-duo-swan flex items-center justify-center text-duo-macaw shadow-[0_4px_0_var(--duo-swan)]">
                  <marker.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-duo-eel uppercase tracking-wider">{marker.title}</h3>
                <p className="text-duo-wolf font-bold leading-relaxed text-sm">
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
