"use client";

import { Sparkles, Brain, MessageCircle, Search } from "lucide-react";

const features = [
  { icon: Brain, text: "Turns entries into durable memories", color: "text-duo-green" },
  { icon: MessageCircle, text: "Natural language conversations", color: "text-duo-blue" },
  { icon: Search, text: "Semantic search across everything", color: "text-duo-orange" },
  { icon: Sparkles, text: "Pattern detection and insights", color: "text-duo-purple" },
];

export function Solution() {
  return (
    <section className="relative py-24 bg-white border-t-2 border-duo-swan">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <h2 className="text-4xl md:text-5xl font-heading font-black text-duo-eel">
            Meet your <span className="text-duo-blue">second brain.</span>
          </h2>
          
          <p className="text-xl text-duo-wolf font-bold leading-relaxed">
            Debo connects your thoughts, remembers everything you write, and lets you ask your past anything. 
            <span className="text-duo-eel"> Stop managing notes and start having conversations with your own mind.</span>
          </p>
          
          <div className="grid sm:grid-cols-2 gap-6 pt-8">
            {features.map(({ icon: Icon, text, color }) => (
              <div 
                key={text}
                className="btn-3d btn-3d-white flex items-center gap-4 p-5 rounded-2xl border-2 border-duo-swan bg-white text-left"
              >
                <div className={`p-3 rounded-xl bg-duo-polar ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-base font-black text-duo-eel">{text}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-wrap justify-center gap-12 pt-12 border-t-2 border-duo-swan">
            {[
              { value: "100%", label: "Your data", color: "text-duo-green" },
              { value: "0", label: "Tags to manage", color: "text-duo-red" },
              { value: "∞", label: "Questions to ask", color: "text-duo-blue" },
            ].map(({ value, label, color }) => (
              <div key={label} className="text-center">
                <div className={`text-4xl font-heading font-black ${color}`}>{value}</div>
                <div className="text-sm font-black text-duo-wolf uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

