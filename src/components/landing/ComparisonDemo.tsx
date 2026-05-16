"use client";

import { useState, useEffect, useRef } from "react";
import { X, Zap, Brain } from "lucide-react";

const LEFT_MESSAGES = [
  {
    id: "l1",
    sender: "You",
    text: "My sister Anya has her first big chess tournament on Oct 24th. She's nervous.",
    isAI: false,
  },
  {
    id: "l2",
    sender: "AI",
    text: "Noted. I'll remember that for next time we talk.",
    isAI: true,
    senderColor: "text-muted-foreground",
  },
  {
    id: "l3",
    sender: "You",
    text: "What should I get Anya for her upcoming event?",
    isAI: false,
  },
  {
    id: "l4",
    sender: "AI",
    text: "Of course. What event is Anya preparing for?",
    isAI: true,
    senderColor: "text-muted-foreground",
  },
];

const RIGHT_MESSAGES = [
  {
    id: "r1",
    sender: "You",
    text: "My sister Anya has her first big chess tournament on Oct 24th. She's nervous.",
    isAI: false,
  },
  {
    id: "r2",
    sender: "Debo",
    text: "Noted. Added to Anya's profile under Chess.",
    isAI: true,
    senderColor: "text-primary",
  },
  {
    id: "r3",
    sender: "You",
    text: "What should I get Anya for her upcoming event?",
    isAI: false,
  },
  {
    id: "r4",
    type: "memory",
  },
  {
    id: "r5",
    sender: "Debo",
    text: "Anya's tournament is on Oct 24th! She mentioned wanting a weighted wooden board. Should I find some options?",
    isAI: true,
    senderColor: "text-primary",
  },
];

export function ComparisonDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const maxMessages = Math.max(LEFT_MESSAGES.length, RIGHT_MESSAGES.length);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          setVisibleCount(0);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (visibleCount >= maxMessages) return;

    const delay = visibleCount === 0 ? 400 : 1200;
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), delay);
    return () => clearTimeout(timer);
  }, [inView, visibleCount, maxMessages]);

  return (
    <section ref={sectionRef} id="demo" className="py-24 px-6">
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="text-center space-y-3">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-primary/70">
            The same conversation, twice
          </div>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Standard AI forgets. Debo remembers.
          </h2>
          <p className="mx-auto max-w-lg text-base font-medium text-muted-foreground">
            Standard AI models lose everything when you close the tab. Debo
            ensures your context lives forever.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Without Debo */}
          <div className="duo-card p-6 space-y-4 opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-destructive/20 bg-destructive/5 text-destructive">
                <X className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-destructive/70">
                Without Debo
              </span>
            </div>

            <div className="space-y-3">
              {LEFT_MESSAGES.map((msg, i) => {
                const isWeeksLater = i === 2;
                return (
                  <div key={msg.id}>
                    {isWeeksLater && (
                      <div
                        className={`border-t-2 border-dashed border-border/50 pt-3 mb-3 transition-opacity duration-500 ${
                          visibleCount > i ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/40">
                          Weeks later
                        </p>
                      </div>
                    )}
                    <div
                      className={`transition-all duration-500 ${
                        visibleCount > i
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-3"
                      }`}
                    >
                      <ChatBubble
                        sender={msg.sender}
                        text={msg.text}
                        isAI={msg.isAI}
                        senderColor={msg.senderColor}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Forgotten indicator */}
              <div
                className={`flex items-center gap-2 rounded-xl border-2 border-destructive/15 bg-destructive/5 px-3 py-2 transition-all duration-500 ${
                  visibleCount > LEFT_MESSAGES.length
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3"
                }`}
              >
                <X className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs font-bold text-destructive/70">
                  Forgotten.
                </span>
              </div>
            </div>
          </div>

          {/* With Debo */}
          <div className="duo-card border-primary/30 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-primary/20 bg-primary/10 text-primary">
                <Zap className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-primary/70">
                With Debo
              </span>
            </div>

            <div className="space-y-3">
              {RIGHT_MESSAGES.map((msg, i) => {
                const isWeeksLater = i === 2;
                return (
                  <div key={msg.id}>
                    {isWeeksLater && (
                      <div
                        className={`border-t-2 border-dashed border-primary/15 pt-3 mb-3 transition-opacity duration-500 ${
                          visibleCount > i ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/40">
                          Weeks later
                        </p>
                      </div>
                    )}
                    {msg.type === "memory" ? (
                      <div
                        className={`my-2 flex items-center gap-2 rounded-lg border-2 border-primary/15 bg-primary/5 px-3 py-1.5 transition-all duration-500 ${
                          visibleCount > i
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-3"
                        }`}
                      >
                        <Brain className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary/70">
                          Memory retrieved
                        </span>
                        <span className="ml-auto text-[10px] font-extrabold tabular-nums text-primary/50">
                          12ms
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`transition-all duration-500 ${
                          visibleCount > i
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-3"
                        }`}
                      >
                        <ChatBubble
                          sender={msg.sender!}
                          text={msg.text!}
                          isAI={msg.isAI}
                          senderColor={msg.senderColor}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Remembered indicator */}
              <div
                className={`flex items-center gap-2 rounded-xl border-2 border-primary/15 bg-primary/5 px-3 py-2 transition-all duration-500 ${
                  visibleCount > RIGHT_MESSAGES.length
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3"
                }`}
              >
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-primary/70">
                  Remembered.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({
  sender,
  text,
  senderColor = "text-foreground",
  isAI = false,
}: {
  sender: string;
  text: string;
  senderColor?: string;
  isAI?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-4 py-3 ${isAI ? "bg-muted/50" : "bg-background"}`}
    >
      <span
        className={`text-[10px] font-extrabold uppercase tracking-widest ${senderColor} mb-1 block`}
      >
        {sender}
      </span>
      <p className="text-sm font-medium leading-relaxed text-foreground/85">
        {text}
      </p>
    </div>
  );
}
