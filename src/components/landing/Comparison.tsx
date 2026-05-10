"use client";

import { XCircle, CheckCircle2, Clock, Brain } from "lucide-react";
import { useEffect, useState } from "react";

export function Comparison() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    const element = document.getElementById("comparison-section");
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="comparison-section" className="py-24 bg-background border-t-2 border-duo-swan overflow-hidden">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-6xl font-heading font-black text-duo-eel leading-tight">
            The same conversation, <span className="text-duo-macaw italic">twice.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-duo-wolf font-bold leading-relaxed">
            Standard AI models forget everything the moment you close the tab. <br className="hidden md:block" />
            Debo ensures your context lives forever.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-px bg-duo-swan/50 rounded-[3rem] border-4 border-duo-swan shadow-[0_16px_0_var(--duo-swan)] overflow-hidden">
          
          {/* Without Debo */}
          <div className="bg-background p-8 md:p-12 flex flex-col h-full">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-duo-cardinal animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-duo-cardinal">Without Debo</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-duo-swan">No Recall</span>
            </div>

            <div className="flex-grow space-y-10">
              <div className={`space-y-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-duo-wolf">You</div>
                <p className="text-lg font-bold text-duo-eel leading-tight">
                  &ldquo;My sister Anya has her first big chess tournament on Oct 24th. She&apos;s nervous.&rdquo;
                </p>
              </div>

              <div className={`space-y-4 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-duo-wolf">AI Model</div>
                <p className="text-lg font-bold text-duo-eel opacity-60 italic">
                  &ldquo;Noted. I&apos;ll remember that for next time we talk.&rdquo;
                </p>
              </div>

              <div className="relative py-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-dashed border-duo-swan/30" />
                </div>
                <span className="relative bg-background px-4 text-xs font-black uppercase tracking-widest text-duo-swan">Weeks later</span>
              </div>

              <div className={`space-y-4 transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-duo-wolf">You</div>
                <p className="text-lg font-bold text-duo-eel">
                  &ldquo;What should I get Anya for her upcoming event?&rdquo;
                </p>
              </div>

              <div className={`space-y-4 transition-all duration-700 delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-duo-cardinal">AI Model</div>
                <p className="text-lg font-bold text-duo-cardinal leading-relaxed">
                  &ldquo;Of course. What event is Anya preparing for?&rdquo;
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t-2 border-duo-swan/20 flex items-center gap-3 text-duo-cardinal">
              <XCircle className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-widest">Forgotten.</span>
            </div>
          </div>

          {/* With Debo */}
          <div className="bg-duo-polar p-8 md:p-12 flex flex-col h-full border-l-4 lg:border-l-0 lg:border-t-0 border-duo-swan relative">
             <div className="absolute top-0 right-0 p-4 opacity-5">
                <Brain className="w-32 h-32 text-duo-macaw" />
             </div>

            <div className="flex items-center justify-between mb-12 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-duo-feather animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-duo-feather">With Debo</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-duo-macaw" />
                <span className="text-[10px] font-black uppercase tracking-widest text-duo-macaw">Retrieved Instantly</span>
              </div>
            </div>

            <div className="flex-grow space-y-10 relative z-10">
              <div className={`space-y-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-duo-wolf">You</div>
                <p className="text-lg font-bold text-duo-eel leading-tight">
                  &ldquo;My sister Anya has her first big chess tournament on Oct 24th. She&apos;s nervous.&rdquo;
                </p>
              </div>

              <div className={`space-y-4 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-duo-wolf">Debo AI</div>
                <p className="text-lg font-bold text-duo-eel">
                  &ldquo;Noted. Added to <span className="text-duo-macaw">Anya&apos;s Profile</span> under Chess.&rdquo;
                </p>
              </div>

              <div className="relative py-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-dashed border-duo-swan/50" />
                </div>
                <span className="relative bg-duo-polar px-4 text-xs font-black uppercase tracking-widest text-duo-swan">Weeks later</span>
              </div>

              <div className={`space-y-4 transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-duo-wolf">You</div>
                <p className="text-lg font-bold text-duo-eel">
                  &ldquo;What should I get Anya for her upcoming event?&rdquo;
                </p>
              </div>

              <div className={`space-y-6 transition-all duration-700 delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="px-5 py-3 rounded-2xl bg-duo-macaw/10 border-2 border-duo-macaw/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="w-4 h-4 text-duo-macaw" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-duo-macaw">Memory Retrieved</span>
                  </div>
                  <span className="text-[10px] font-black text-duo-macaw/50">12ms</span>
                </div>
                <p className="text-lg font-bold text-duo-eel leading-relaxed">
                  &ldquo;Anya&apos;s tournament is on Oct 24th! She mentioned wanting a <span className="text-duo-feather underline decoration-2 underline-offset-4">weighted wooden board</span>. Should I find some options?&rdquo;
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t-2 border-duo-swan/20 flex items-center gap-3 text-duo-feather">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-widest">Remembered.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
