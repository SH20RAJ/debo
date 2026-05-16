"use client";

import { X, Zap, Brain } from "lucide-react";

export function ComparisonDemo() {
  return (
    <section className="py-24 px-6">
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
          <div className="duo-card p-6 space-y-5 opacity-80">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-destructive/20 bg-destructive/5 text-destructive">
                <X className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-destructive/70">
                Without Debo
              </span>
            </div>

            <div className="space-y-4">
              <ChatBubble
                sender="You"
                text="My sister Anya has her first big chess tournament on Oct 24th. She's nervous."
              />
              <ChatBubble
                sender="AI"
                senderColor="text-muted-foreground"
                text="Noted. I'll remember that for next time we talk."
                isAI
              />

              <div className="border-t-2 border-dashed border-border/50 pt-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/40 mb-3">
                  Weeks later
                </p>
                <ChatBubble
                  sender="You"
                  text="What should I get Anya for her upcoming event?"
                />
                <ChatBubble
                  sender="AI"
                  senderColor="text-muted-foreground"
                  text="Of course. What event is Anya preparing for?"
                  isAI
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border-2 border-destructive/15 bg-destructive/5 px-3 py-2">
                <X className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs font-bold text-destructive/70">
                  Forgotten.
                </span>
              </div>
            </div>
          </div>

          {/* With Debo */}
          <div className="duo-card border-primary/30 p-6 space-y-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-primary/20 bg-primary/10 text-primary">
                <Zap className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-primary/70">
                With Debo
              </span>
            </div>

            <div className="space-y-4">
              <ChatBubble
                sender="You"
                text="My sister Anya has her first big chess tournament on Oct 24th. She's nervous."
              />
              <ChatBubble
                sender="Debo"
                senderColor="text-primary"
                text="Noted. Added to Anya's profile under Chess."
                isAI
              />

              <div className="border-t-2 border-dashed border-primary/15 pt-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/40 mb-3">
                  Weeks later
                </p>
                <ChatBubble
                  sender="You"
                  text="What should I get Anya for her upcoming event?"
                />

                {/* Memory recall indicator */}
                <div className="my-2 flex items-center gap-2 rounded-lg border-2 border-primary/15 bg-primary/5 px-3 py-1.5">
                  <Brain className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary/70">
                    Memory retrieved
                  </span>
                  <span className="ml-auto text-[10px] font-extrabold tabular-nums text-primary/50">
                    12ms
                  </span>
                </div>

                <ChatBubble
                  sender="Debo"
                  senderColor="text-primary"
                  text="Anya's tournament is on Oct 24th! She mentioned wanting a weighted wooden board. Should I find some options?"
                  isAI
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border-2 border-primary/15 bg-primary/5 px-3 py-2">
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
    <div className={`rounded-xl px-4 py-3 ${isAI ? "bg-muted/50" : "bg-background"}`}>
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
