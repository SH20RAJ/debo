import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingUp, Users, Zap, Brain, MessageSquare, Database, Shield, Globe, Mail, Star, Crown, Flame, Gem } from "lucide-react";

export const metadata: Metadata = {
  title: "Debo - The AI Companion That Remembers Everything",
  description: "Invest in the future of personal AI assistants. Debo is your second brain that learns, remembers, and helps you think better.",
};

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#4B4B4B] font-['Nunito',sans-serif]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-md border-b-2 border-[#E5E5E5]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl border-2 border-[#58CC02] bg-[#58CC02] text-lg font-extrabold text-white shadow-[0_4px_0_#46A302]">
              D
            </span>
            <span className="font-extrabold text-xl tracking-wide">debo</span>
          </div>
          <a href="#contact" className="px-6 py-3 bg-[#58CC02] hover:brightness-105 text-white font-extrabold text-sm rounded-xl border-b-[4px] border-[#46A302] active:border-b-0 active:mt-[4px] active:translate-y-[4px] transition-all uppercase tracking-wider">
            Contact Us
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-6 py-32 overflow-hidden bg-[#FFFFFF]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#89E219]/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#1CB0F6]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#CE82FF]/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#58CC02]/20 text-[#58CC02] font-extrabold uppercase tracking-wide text-sm border-2 border-[#58CC02]/30">
            <Zap className="h-4 w-4" />
            <span>Seed Round</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-[#4B4B4B]">
            Your second brain,<br />
            <span className="text-[#58CC02]">now</span> it actually <span className="text-[#1CB0F6]">remembers</span>.
          </h1>

          <p className="text-xl text-[#777777] max-w-2xl mx-auto font-medium leading-relaxed">
            Debo is an AI companion that learns from your entire digital life—journals, conversations, notes, memories—to help you think better, remember everything, and make smarter decisions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6">
            <a href="#problem" className="group flex items-center justify-center gap-2 px-10 py-5 bg-[#58CC02] hover:brightness-105 text-white font-extrabold text-lg rounded-2xl border-b-[5px] border-[#46A302] active:border-b-0 active:mt-[5px] active:translate-y-[5px] transition-all">
              See the problem <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#contact" className="px-10 py-5 bg-[#FFFFFF] text-[#4B4B4B] font-extrabold text-lg rounded-2xl border-2 border-[#E5E5E5] border-b-[4px] active:border-b-2 active:mt-[2px] active:translate-y-[2px] transition-all">
              Investor inquiry
            </a>
          </div>
        </div>

        {/* Floating stats */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 text-sm font-extrabold text-[#AFAFAF]">
          <span>$2M ARR target</span>
          <span className="w-1 h-1 bg-[#E5E5E5] rounded-full" />
          <span>AI companion market: $80B by 2030</span>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="py-32 px-6 bg-[#F7F7F7]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#FF4B4B] font-extrabold uppercase tracking-widest text-sm">the problem</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-4 text-[#4B4B4B]">your memory is broken</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#FFFFFF] border-2 border-[#E5E5E5] shadow-[0_2px_0_#E5E5E5] hover:border-[#FF4B4B]/50 hover:shadow-none transition-all">
              <div className="w-14 h-14 rounded-xl bg-[#FF4B4B]/20 flex items-center justify-center mb-6">
                <Brain className="h-7 w-7 text-[#FF4B4B]" />
              </div>
              <h3 className="text-xl font-extrabold mb-3 text-[#4B4B4B]">forgotten insights</h3>
              <p className="text-[#777777] leading-relaxed">
                You write in journals, take notes, have conversations—but it all vanishes. The golden insights you had last month? gone.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#FFFFFF] border-2 border-[#E5E5E5] shadow-[0_2px_0_#E5E5E5] hover:border-[#FF9600]/50 hover:shadow-none transition-all">
              <div className="w-14 h-14 rounded-xl bg-[#FF9600]/20 flex items-center justify-center mb-6">
                <MessageSquare className="h-7 w-7 text-[#FF9600]" />
              </div>
              <h3 className="text-xl font-extrabold mb-3 text-[#4B4B4B]">disconnected context</h3>
              <p className="text-[#777777] leading-relaxed">
                Your chat apps, email, notes, and memories live in silos. You can't connect the dots across your entire digital life.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#FFFFFF] border-2 border-[#E5E5E5] shadow-[0_2px_0_#E5E5E5] hover:border-[#FFC800]/50 hover:shadow-none transition-all">
              <div className="w-14 h-14 rounded-xl bg-[#FFC800]/20 flex items-center justify-center mb-6">
                <Database className="h-7 w-7 text-[#FFC800]" />
              </div>
              <h3 className="text-xl font-extrabold mb-3 text-[#4B4B4B]">data graveyard</h3>
              <p className="text-[#777777] leading-relaxed">
                80% of personal data is never used again after creation. It sits in vaults, forgotten and useless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-32 px-6 bg-[#FFFFFF]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#58CC02] font-extrabold uppercase tracking-widest text-sm">the solution</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-4 text-[#4B4B4B]">meet debo: your thinking partner</h2>
          </div>

          <div className="relative">
            {/* Mockup / UI representation */}
            <div className="bg-[#FFFFFF] rounded-2xl border-2 border-[#E5E5E5] p-8 md:p-12 shadow-[0_2px_0_#E5E5E5]">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-[#E5E5E5]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF4B4B]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFC800]" />
                  <div className="w-3 h-3 rounded-full bg-[#58CC02]" />
                </div>
                <span className="ml-4 text-sm text-[#AFAFAF] font-medium">debo ai companion</span>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#58CC02] flex items-center justify-center text-white font-extrabold">D</div>
                  <div className="flex-1 p-4 rounded-xl bg-[#F7F7F7] text-[#777777] text-sm">
                    I noticed you mentioned &quot;start a podcast&quot; in your journal 3 months ago. You also had a conversation about audio equipment with sarah last week. want to explore this?
                  </div>
                </div>

                <div className="flex gap-4 flex-row-reverse">
                  <div className="w-10 h-10 rounded-full bg-[#1CB0F6] flex items-center justify-center text-white font-extrabold">Y</div>
                  <div className="flex-1 p-4 rounded-xl bg-[#1CB0F6]/20 text-[#4B4B4B] text-sm">
                    wait, I forgot about that! yeah, I've been thinking about it more. what do you know about the space?
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#58CC02] flex items-center justify-center text-white font-extrabold">D</div>
                  <div className="flex-1 p-4 rounded-xl bg-[#F7F7F7] text-[#777777] text-sm">
                    based on your notes and recent research, here's a quick market overview and 3 episodes we could record covering your expertise in...
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mt-12">
            <div className="text-center p-6 rounded-xl bg-[#F7F7F7] border-2 border-[#E5E5E5]">
              <div className="text-3xl font-extrabold text-[#58CC02] mb-2">365 days</div>
              <div className="text-[#AFAFAF] text-sm font-bold">of continuous memory</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-[#F7F7F7] border-2 border-[#E5E5E5]">
              <div className="text-3xl font-extrabold text-[#1CB0F6] mb-2">10k+</div>
              <div className="text-[#AFAFAF] text-sm font-bold">data points analyzed</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-[#F7F7F7] border-2 border-[#E5E5E5]">
              <div className="text-3xl font-extrabold text-[#CE82FF] mb-2">50+</div>
              <div className="text-[#AFAFAF] text-sm font-bold">integrations</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-[#F7F7F7] border-2 border-[#E5E5E5]">
              <div className="text-3xl font-extrabold text-[#FFC800] mb-2">24/7</div>
              <div className="text-[#AFAFAF] text-sm font-bold">always learning</div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Features */}
      <section className="py-32 px-6 bg-[#F7F7F7]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#1CB0F6] font-extrabold uppercase tracking-widest text-sm">product</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-4 text-[#4B4B4B]">what debo does</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: MessageSquare, color: "text-[#1CB0F6]", title: "smart capture", desc: "voice, text, image capture with AI context understanding" },
              { icon: Brain, color: "text-[#CE82FF]", title: "memory engine", desc: "stores and connects every piece of your digital life" },
              { icon: Zap, color: "text-[#58CC02]", title: "instant recall", desc: "ask anything and get contextual answers instantly" },
              { icon: TrendingUp, color: "text-[#FFC800]", title: "pattern insights", desc: "AI-powered insights about your habits and thinking" },
              { icon: Database, color: "text-[#FF9600]", title: "semantic search", desc: "find anything across all your data in plain English" },
              { icon: Shield, color: "text-[#FF4B4B]", title: "private by default", desc: "your data never trains our models. end-to-end encryption." },
            ].map((feature, i) => (
              <div key={i} className="flex gap-5 p-6 rounded-2xl bg-[#FFFFFF] border-2 border-[#E5E5E5] hover:border-[#58CC02] transition-colors shadow-[0_2px_0_#E5E5E5] hover:shadow-none">
                <div className="w-12 h-12 rounded-xl bg-[#F7F7F7] flex items-center justify-center flex-shrink-0">
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg mb-2 text-[#4B4B4B]">{feature.title}</h3>
                  <p className="text-[#777777] text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market */}
      <section className="py-32 px-6 bg-[#FFFFFF]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#FFC800] font-extrabold uppercase tracking-widest text-sm">market opportunity</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-4 text-[#4B4B4B]">a massive, growing market</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-[#58CC02]/10 border-2 border-[#58CC02]">
              <div className="text-5xl font-extrabold text-[#58CC02] mb-4">$80B</div>
              <div className="text-lg font-extrabold mb-2 text-[#4B4B4B]">AI companion market</div>
              <p className="text-[#777777] text-sm">expected by 2030 (CAGR 32%)</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-[#1CB0F6]/10 border-2 border-[#1CB0F6]">
              <div className="text-5xl font-extrabold text-[#1CB0F6] mb-4">500M+</div>
              <div className="text-lg font-extrabold mb-2 text-[#4B4B4B]">productive users</div>
              <p className="text-[#777777] text-sm">seeking better memory & thinking tools</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-[#CE82FF]/10 border-2 border-[#CE82FF]">
              <div className="text-5xl font-extrabold text-[#CE82FF] mb-4">$12B</div>
              <div className="text-lg font-extrabold mb-2 text-[#4B4B4B]">personal knowledge</div>
              <p className="text-[#777777] text-sm">tools market by 2028</p>
            </div>
          </div>

          <div className="mt-16 p-8 rounded-2xl bg-[#F7F7F7] border-2 border-[#E5E5E5]">
            <h3 className="text-xl font-extrabold mb-6 text-[#4B4B4B]">target segments</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="font-extrabold text-[#58CC02] mb-2">creators</div>
                <p className="text-[#777777] text-sm">YouTubers, podcasters, writers who need to remember ideas</p>
              </div>
              <div>
                <div className="font-extrabold text-[#1CB0F6] mb-2">founders</div>
                <p className="text-[#777777] text-sm">building companies while managing multiple streams of info</p>
              </div>
              <div>
                <div className="font-extrabold text-[#CE82FF] mb-2">researchers</div>
                <p className="text-[#777777] text-sm">academics & professionals managing large knowledge bases</p>
              </div>
              <div>
                <div className="font-extrabold text-[#FFC800] mb-2">lifelong learners</div>
                <p className="text-[#777777] text-sm">anyone who wants to retain and leverage their learning</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Traction */}
      <section className="py-32 px-6 bg-[#F7F7F7]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#58CC02] font-extrabold uppercase tracking-widest text-sm">traction</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-4 text-[#4B4B4B]">early momentum</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-8 rounded-2xl bg-[#FFFFFF] border-2 border-[#E5E5E5] shadow-[0_2px_0_#E5E5E5]">
              <div className="text-4xl font-extrabold text-[#4B4B4B] mb-2">2,500+</div>
              <div className="text-[#777777] font-bold">waitlist signups</div>
            </div>
            <div className="text-center p-8 rounded-2xl bg-[#FFFFFF] border-2 border-[#E5E5E5] shadow-[0_2px_0_#E5E5E5]">
              <div className="text-4xl font-extrabold text-[#4B4B4B] mb-2">150+</div>
              <div className="text-[#777777] font-bold">beta users</div>
            </div>
            <div className="text-center p-8 rounded-2xl bg-[#FFFFFF] border-2 border-[#E5E5E5] shadow-[0_2px_0_#E5E5E5]">
              <div className="text-4xl font-extrabold text-[#4B4B4B] mb-2">45%</div>
              <div className="text-[#777777] font-bold">weekly retention</div>
            </div>
            <div className="text-center p-8 rounded-2xl bg-[#FFFFFF] border-2 border-[#E5E5E5] shadow-[0_2px_0_#E5E5E5]">
              <div className="text-4xl font-extrabold text-[#4B4B4B] mb-2 flex items-center justify-center gap-1">
                <Star className="h-6 w-6 fill-[#FFC800] text-[#FFC800]" />
                4.8
              </div>
              <div className="text-[#777777] font-bold">beta rating</div>
            </div>
          </div>

          <div className="mt-12 p-8 rounded-2xl bg-[#58CC02]/10 border-2 border-[#58CC02] text-center">
            <h3 className="text-2xl font-extrabold text-[#58CC02] mb-2">$2M ARR target</h3>
            <p className="text-[#777777]">first year revenue goal based on early interest and pricing model</p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-32 px-6 bg-[#FFFFFF]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#1CB0F6] font-extrabold uppercase tracking-widest text-sm">team</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-4 text-[#4B4B4B]">built by builders</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-[#F7F7F7] border-2 border-[#E5E5E5]">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#58CC02] to-[#1CB0F6] mx-auto mb-6 flex items-center justify-center text-3xl font-extrabold text-white">
                S
              </div>
              <h3 className="text-xl font-extrabold mb-2 text-[#4B4B4B]">shaswat raj</h3>
              <p className="text-[#58CC02] font-bold mb-4">founder & CEO</p>
              <p className="text-[#777777] text-sm">building AI products for 5+ years. previously built developer tools reaching 10K+ users.</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-[#F7F7F7] border-2 border-[#E5E5E5]">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1CB0F6] to-[#CE82FF] mx-auto mb-6 flex items-center justify-center text-3xl font-extrabold text-white">
                AI
              </div>
              <h3 className="text-xl font-extrabold mb-2 text-[#4B4B4B]">AI advisors</h3>
              <p className="text-[#1CB0F6] font-bold mb-4">technical advisors</p>
              <p className="text-[#777777] text-sm">former Google, Meta engineers with expertise in LLMs and personal AI.</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-[#F7F7F7] border-2 border-[#E5E5E5]">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#CE82FF] to-[#FF9600] mx-auto mb-6 flex items-center justify-center text-3xl font-extrabold text-white">
                3
              </div>
              <h3 className="text-xl font-extrabold mb-2 text-[#4B4B4B]">growing team</h3>
              <p className="text-[#CE82FF] font-bold mb-4">hiring</p>
              <p className="text-[#777777] text-sm">looking for ML engineers, full-stack developers to join our journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Ask */}
      <section className="py-32 px-6 bg-[#F7F7F7]">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[#FFC800] font-extrabold uppercase tracking-widest text-sm">the ask</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-4 mb-8 text-[#4B4B4B]">join us in building the future of thinking</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="p-8 rounded-2xl bg-[#FFFFFF] border-2 border-[#E5E5E5] shadow-[0_2px_0_#E5E5E5]">
              <div className="text-3xl font-extrabold text-[#58CC02] mb-2">$1.5M</div>
              <div className="font-extrabold mb-2 text-[#4B4B4B]">seed round</div>
              <p className="text-[#777777] text-sm">18 months runway to reach $2M ARR</p>
            </div>
            <div className="p-8 rounded-2xl bg-[#FFFFFF] border-2 border-[#E5E5E5] shadow-[0_2px_0_#E5E5E5]">
              <div className="text-3xl font-extrabold text-[#1CB0F6] mb-2">12-15%</div>
              <div className="font-extrabold mb-2 text-[#4B4B4B]">equity offered</div>
              <p className="text-[#777777] text-sm">pricing based on seed benchmarks</p>
            </div>
          </div>

          <p className="text-[#777777] text-lg mb-8">
            we're looking for strategic investors who believe in the future of personal AI—people who see the potential in helping everyone think better with AI that actually knows them.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-32 px-6 bg-[#FFFFFF]">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-[#58CC02] font-extrabold uppercase tracking-widest text-sm">contact</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-4 mb-8 text-[#4B4B4B]">let's talk</h2>

          <p className="text-[#777777] text-lg mb-8">
            we'd love to hear from investors who share our vision. reach out to discuss the opportunity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href="mailto:investors@debo.life?subject=Investment Inquiry - Debo Seed Round"
              className="flex items-center justify-center gap-3 px-8 py-5 bg-[#58CC02] hover:brightness-105 text-white font-extrabold text-lg rounded-2xl border-b-[5px] border-[#46A302] active:border-b-0 active:mt-[5px] active:translate-y-[5px] transition-all w-full sm:w-auto"
            >
              <Mail className="h-5 w-5" />
              investors@debo.life
            </a>
            <a
              href="https://debo.life"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-5 bg-[#FFFFFF] text-[#4B4B4B] font-extrabold text-lg rounded-2xl border-2 border-[#E5E5E5] border-b-[4px] active:border-b-2 active:mt-[2px] active:translate-y-[2px] transition-all w-full sm:w-auto"
            >
              <Globe className="h-5 w-5" />
              debo.life
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t-2 border-[#E5E5E5]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl border-2 border-[#58CC02] bg-[#58CC02] text-sm font-extrabold text-white shadow-[0_3px_0_#46A302]">
              D
            </span>
            <span className="font-extrabold">debo</span>
          </div>
          <p className="text-[#AFAFAF] text-sm">
            © 2025 Debo AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}