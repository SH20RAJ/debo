import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingUp, Users, Zap, Brain, MessageSquare, Database, Shield, Globe, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Debo - The AI Companion That Remembers Everything",
  description: "Invest in the future of personal AI assistants. Debo is your second brain that learns, remembers, and helps you think better.",
};

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-[#0a0f14] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f14]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl border-2 border-[#58CC02] bg-[#58CC02] text-sm font-black text-white shadow-[0_4px_0_#46a302]">
              D
            </span>
            <span className="font-bold text-xl">Debo</span>
          </div>
          <a href="#contact" className="px-5 py-2.5 bg-[#58CC02] hover:bg-[#46a302] text-white font-extrabold text-sm rounded-xl border-b-[4px] border-[#46a302] active:border-b-0 active:mt-[4px] transition-all">
            Contact Us
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-6 py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#58CC02]/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#1CB0F6]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#CE82FF]/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#58CC02]/20 text-[#58CC02] font-extrabold uppercase tracking-wide text-sm border-2 border-[#58CC02]/30">
            <Zap className="h-4 w-4" />
            <span>Seed Round</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
            Your Second Brain,<br />
            <span className="text-[#58CC02]">Now</span> It Actually <span className="text-[#1CB0F6]">Remembers</span>.
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Debo is an AI companion that learns from your entire digital life—journals, conversations, notes, memories—to help you think better, remember everything, and make smarter decisions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6">
            <a href="#problem" className="group flex items-center justify-center gap-2 px-10 py-5 bg-[#58CC02] hover:bg-[#46a302] text-white font-extrabold text-lg rounded-2xl border-b-[5px] border-[#46a302] active:border-b-0 active:mt-[5px] transition-all">
              See the Problem <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#contact" className="px-10 py-5 bg-[#1f2937] hover:bg-[#374151] text-white font-extrabold text-lg rounded-2xl border-2 border-[#374151] border-b-[5px] active:border-b-2 active:mt-[3px] transition-all">
              Investor Inquiry
            </a>
          </div>
        </div>

        {/* Floating stats */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 text-sm font-bold text-slate-500">
          <span>$2M ARR Target</span>
          <span className="w-1 h-1 bg-slate-600 rounded-full" />
          <span>AI Companion Market: $80B by 2030</span>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="py-32 px-6 bg-[#0f151c]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#FF4B4B] font-extrabold uppercase tracking-widest text-sm">The Problem</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4">Your Memory Is Broken</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#FF4B4B]/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[#FF4B4B]/20 flex items-center justify-center mb-6">
                <Brain className="h-7 w-7 text-[#FF4B4B]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Forgotten Insights</h3>
              <p className="text-slate-400 leading-relaxed">
                You write in journals, take notes, have conversations—but it all vanishes. The golden insights you had last month? Gone.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#FF9600]/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[#FF9600]/20 flex items-center justify-center mb-6">
                <MessageSquare className="h-7 w-7 text-[#FF9600]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Disconnected Context</h3>
              <p className="text-slate-400 leading-relaxed">
                Your chat apps, email, notes, and memories live in silos. You can&apos;t connect the dots across your entire digital life.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#FFC800]/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[#FFC800]/20 flex items-center justify-center mb-6">
                <Database className="h-7 w-7 text-[#FFC800]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Data Graveyard</h3>
              <p className="text-slate-400 leading-relaxed">
                80% of personal data is never used again after creation. It sits in vaults, forgotten and useless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#58CC02] font-extrabold uppercase tracking-widest text-sm">The Solution</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4">Meet Debo: Your Thinking Partner</h2>
          </div>

          <div className="relative">
            {/* Mockup / UI representation */}
            <div className="bg-[#131f24] rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF4B4B]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFC800]" />
                  <div className="w-3 h-3 rounded-full bg-[#58CC02]" />
                </div>
                <span className="ml-4 text-sm text-slate-500 font-mono">Debo AI Companion</span>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#58CC02] flex items-center justify-center text-black font-bold text-sm">D</div>
                  <div className="flex-1 p-4 rounded-2xl bg-white/5 text-slate-300 text-sm">
                    I noticed you mentioned &quot;start a podcast&quot; in your journal 3 months ago. You also had a conversation about audio equipment with Sarah last week. Want to explore this?
                  </div>
                </div>

                <div className="flex gap-4 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-[#1CB0F6] flex items-center justify-center text-white font-bold text-sm">Y</div>
                  <div className="flex-1 p-4 rounded-2xl bg-[#1CB0F6]/20 text-white text-sm">
                    Wait, I forgot about that! Yeah, I've been thinking about it more. What do you know about the space?
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#58CC02] flex items-center justify-center text-black font-bold text-sm">D</div>
                  <div className="flex-1 p-4 rounded-2xl bg-white/5 text-slate-300 text-sm">
                    Based on your notes and recent research, here's a quick market overview and 3 episodes we could record covering your expertise in...
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mt-12">
            <div className="text-center p-6">
              <div className="text-3xl font-black text-[#58CC02] mb-2">365 Days</div>
              <div className="text-slate-500 text-sm font-medium">Of continuous memory</div>
            </div>
            <div className="text-center p-6">
              <div className="text-3xl font-black text-[#1CB0F6] mb-2">10K+</div>
              <div className="text-slate-500 text-sm font-medium">Data points analyzed</div>
            </div>
            <div className="text-center p-6">
              <div className="text-3xl font-black text-[#CE82FF] mb-2">50+</div>
              <div className="text-slate-500 text-sm font-medium">Integrations</div>
            </div>
            <div className="text-center p-6">
              <div className="text-3xl font-black text-[#FFC800] mb-2">24/7</div>
              <div className="text-slate-500 text-sm font-medium">Always learning</div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Features */}
      <section className="py-32 px-6 bg-[#0f151c]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#1CB0F6] font-extrabold uppercase tracking-widest text-sm">Product</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4">What Debo Does</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: MessageSquare, color: "text-[#1CB0F6]", title: "Smart Capture", desc: "Voice, text, image capture with AI context understanding" },
              { icon: Brain, color: "text-[#CE82FF]", title: "Memory Engine", desc: "Stores and connects every piece of your digital life" },
              { icon: Zap, color: "text-[#58CC02]", title: "Instant Recall", desc: "Ask anything and get contextual answers instantly" },
              { icon: TrendingUp, color: "text-[#FFC800]", title: "Pattern Insights", desc: "AI-powered insights about your habits and thinking" },
              { icon: Database, color: "text-[#FF9600]", title: "Semantic Search", desc: "Find anything across all your data in plain English" },
              { icon: Shield, color: "text-[#FF4B4B]", title: "Private by Default", desc: "Your data never trains our models. End-to-end encryption." },
            ].map((feature, i) => (
              <div key={i} className="flex gap-5 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#FFC800] font-extrabold uppercase tracking-widest text-sm">Market Opportunity</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4">A Massive, Growing Market</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-3xl bg-[#58CC02]/10 border border-[#58CC02]/30">
              <div className="text-5xl font-black text-[#58CC02] mb-4">$80B</div>
              <div className="text-lg font-bold mb-2">AI Companion Market</div>
              <p className="text-slate-400 text-sm">Expected by 2030 (CAGR 32%)</p>
            </div>

            <div className="text-center p-8 rounded-3xl bg-[#1CB0F6]/10 border border-[#1CB0F6]/30">
              <div className="text-5xl font-black text-[#1CB0F6] mb-4">500M+</div>
              <div className="text-lg font-bold mb-2">Productive Users</div>
              <p className="text-slate-400 text-sm">Seeking better memory & thinking tools</p>
            </div>

            <div className="text-center p-8 rounded-3xl bg-[#CE82FF]/10 border border-[#CE82FF]/30">
              <div className="text-5xl font-black text-[#CE82FF] mb-4">$12B</div>
              <div className="text-lg font-bold mb-2">Personal Knowledge</div>
              <p className="text-slate-400 text-sm">Tools market by 2028</p>
            </div>
          </div>

          <div className="mt-16 p-8 rounded-3xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-bold mb-6">Target Segments</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="font-bold text-[#58CC02] mb-2">Creators</div>
                <p className="text-slate-400 text-sm">YouTubers, podcasters, writers who need to remember ideas</p>
              </div>
              <div>
                <div className="font-bold text-[#1CB0F6] mb-2">Founders</div>
                <p className="text-slate-400 text-sm">Building companies while managing multiple streams of info</p>
              </div>
              <div>
                <div className="font-bold text-[#CE82FF] mb-2">Researchers</div>
                <p className="text-slate-400 text-sm">Academics & professionals managing large knowledge bases</p>
              </div>
              <div>
                <div className="font-bold text-[#FFC800] mb-2">Lifelong Learners</div>
                <p className="text-slate-400 text-sm">Anyone who wants to retain and leverage their learning</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Traction */}
      <section className="py-32 px-6 bg-[#0f151c]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#58CC02] font-extrabold uppercase tracking-widest text-sm">Traction</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4">Early Momentum</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="text-4xl font-black text-white mb-2">2,500+</div>
              <div className="text-slate-400 font-medium">Waitlist Signups</div>
            </div>
            <div className="text-center p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="text-4xl font-black text-white mb-2">150+</div>
              <div className="text-slate-400 font-medium">Beta Users</div>
            </div>
            <div className="text-center p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="text-4xl font-black text-white mb-2">45%</div>
              <div className="text-slate-400 font-medium">Weekly Retention</div>
            </div>
            <div className="text-center p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="text-4xl font-black text-white mb-2">4.8★</div>
              <div className="text-slate-400 font-medium">Beta Rating</div>
            </div>
          </div>

          <div className="mt-12 p-8 rounded-3xl bg-[#58CC02]/10 border border-[#58CC02]/30 text-center">
            <h3 className="text-2xl font-black text-[#58CC02] mb-2">$2M ARR Target</h3>
            <p className="text-slate-300">First year revenue goal based on early interest and pricing model</p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#1CB0F6] font-extrabold uppercase tracking-widest text-sm">Team</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4">Built by Builders</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#58CC02] to-[#1CB0F6] mx-auto mb-6 flex items-center justify-center text-2xl font-black">
                S
              </div>
              <h3 className="text-xl font-bold mb-2">Shaswat Raj</h3>
              <p className="text-[#58CC02] font-medium mb-4">Founder & CEO</p>
              <p className="text-slate-400 text-sm">Building AI products for 5+ years. Previously built developer tools reaching 10K+ users.</p>
            </div>

            <div className="text-center p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1CB0F6] to-[#CE82FF] mx-auto mb-6 flex items-center justify-center text-2xl font-black">
                AI
              </div>
              <h3 className="text-xl font-bold mb-2">AI Advisors</h3>
              <p className="text-[#1CB0F6] font-medium mb-4">Technical Advisors</p>
              <p className="text-slate-400 text-sm">Former Google, Meta engineers with expertise in LLMs and personal AI.</p>
            </div>

            <div className="text-center p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#CE82FF] to-[#FF9600] mx-auto mb-6 flex items-center justify-center text-2xl font-black">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Growing Team</h3>
              <p className="text-[#CE82FF] font-medium mb-4">Hiring</p>
              <p className="text-slate-400 text-sm">Looking for ML engineers, full-stack developers to join our journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Ask */}
      <section className="py-32 px-6 bg-[#0f151c]">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[#FFC800] font-extrabold uppercase tracking-widest text-sm">The Ask</span>
          <h2 className="text-4xl md:text-5xl font-black mt-4 mb-8">Join Us in Building the Future of Thinking</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="text-3xl font-black text-[#58CC02] mb-2">$1.5M</div>
              <div className="font-bold mb-2">Seed Round</div>
              <p className="text-slate-400 text-sm">18 months runway to reach $2M ARR</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="text-3xl font-black text-[#1CB0F6] mb-2">12-15%</div>
              <div className="font-bold mb-2">Equity Offered</div>
              <p className="text-slate-400 text-sm">Pricing based on seed benchmarks</p>
            </div>
          </div>

          <p className="text-slate-400 text-lg mb-8">
            We&apos;re looking for strategic investors who believe in the future of personal AI—people who see the potential in helping everyone think better with AI that actually knows them.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-32 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-[#58CC02] font-extrabold uppercase tracking-widest text-sm">Contact</span>
          <h2 className="text-4xl md:text-5xl font-black mt-4 mb-8">Let&apos;s Talk</h2>

          <p className="text-slate-400 text-lg mb-8">
            We&apos;d love to hear from investors who share our vision. Reach out to discuss the opportunity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href="mailto:investors@debo.ai?subject=Investment Inquiry - Debo Seed Round"
              className="flex items-center justify-center gap-3 px-8 py-5 bg-[#58CC02] hover:bg-[#46a302] text-white font-extrabold text-lg rounded-2xl border-b-[5px] border-[#46a302] active:border-b-0 active:mt-[5px] transition-all w-full sm:w-auto"
            >
              <Mail className="h-5 w-5" />
              investors@debo.ai
            </a>
            <a
              href="https://debo.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-5 bg-[#1f2937] hover:bg-[#374151] text-white font-extrabold text-lg rounded-2xl border-2 border-[#374151] border-b-[5px] active:border-b-2 active:mt-[3px] transition-all w-full sm:w-auto"
            >
              <Globe className="h-5 w-5" />
              debo.ai
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-xl border-2 border-[#58CC02] bg-[#58CC02] text-xs font-black text-white">
              D
            </span>
            <span className="font-bold">Debo</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2025 Debo AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}