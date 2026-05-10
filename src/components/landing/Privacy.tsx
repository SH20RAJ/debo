"use client";

import { Shield, Lock, Trash2, Download, EyeOff, Globe } from "lucide-react";

const privacyFeatures = [
  {
    icon: Lock,
    title: "Private by default",
    description: "Your data is encrypted and only accessible by you. We never train models on your personal data without permission.",
  },
  {
    icon: Download,
    title: "Export anytime",
    description: "It's your data. Download your entire history in open formats (JSON, Markdown) whenever you want.",
  },
  {
    icon: Trash2,
    title: "Delete anytime",
    description: "Total control. One click to permanently delete your entire account and all associated memory data.",
  },
  {
    icon: EyeOff,
    title: "No selling data",
    description: "Our business model is simple: we sell a service, not your personal life story. We never sell data to advertisers.",
  },
  {
    icon: Globe,
    title: "Open-source core",
    description: "Transparency matters. Our memory extraction and storage logic is open-source for public auditing.",
  },
  {
    icon: Shield,
    title: "User-approved actions",
    description: "Debo can draft calendar events or reminders, but nothing is created without your explicit approval.",
  },
];

export function Privacy() {
  return (
    <section id="privacy" className="py-24 bg-background border-t-2 border-duo-swan">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/3 space-y-8 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-heading font-black text-duo-eel leading-tight">
              Built for your <span className="text-duo-feather">most personal</span> data.
            </h2>
            <p className="text-xl text-duo-wolf font-bold leading-relaxed">
              We believe your memories are yours alone. Debo is architected from the ground up to be the most private way to store your life documentary.
            </p>
          </div>
          
          <div className="lg:w-2/3 grid sm:grid-cols-2 gap-8">
            {privacyFeatures.map((feature, i) => (
              <div key={i} className="duo-card p-8 flex flex-col gap-4 shadow-[0_4px_0_var(--duo-swan)]">
                <div className="w-14 h-14 rounded-2xl bg-duo-polar border-2 border-duo-swan flex items-center justify-center text-duo-macaw">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-duo-eel uppercase tracking-wider">{feature.title}</h3>
                <p className="text-duo-wolf font-bold leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

  );
}


