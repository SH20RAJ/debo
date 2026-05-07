"use client";

import { User, Bot, Calendar, Check, Mic2, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageProps {
  type: "user" | "bot";
  children: React.ReactNode;
}

function Message({ type, children }: MessageProps) {
  const isUser = type === "user";
  return (
    <div className={`flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
      <div className={`shrink-0 p-3 rounded-2xl border-2 ${isUser ? "bg-muted border-duo-swan" : "bg-duo-green/10 border-duo-green"}`}>
        {isUser ? (
          <User className="w-6 h-6 text-duo-wolf" />
        ) : (
          <Bot className="w-6 h-6 text-duo-green" />
        )}
      </div>
      <div className={`hover-pop relative px-5 py-4 rounded-2xl border-2 ${isUser ? "bg-background border-duo-swan" : "bg-background border-duo-green"} before:content-[''] before:absolute before:top-4 before:-left-[9px] before:w-4 before:h-4 before:bg-background before:border-l-2 before:border-b-2 ${isUser ? "before:border-duo-swan" : "before:border-duo-green"} before:rotate-45`}>
        {children}
      </div>
    </div>
  );
}

export function Demo() {
  return (
    <section id="demo" className="py-24 bg-background border-t-2 border-duo-swan">
      <div className="container mx-auto max-w-4xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-duo-eel mb-4">
            Real queries. <span className="text-duo-blue">Real context.</span>
          </h2>
          <div className="w-full h-4 bg-duo-swan rounded-full overflow-hidden mb-8">
            <div className="h-full bg-duo-green w-[75%] transition-all duration-1000" />
          </div>
        </div>

        <div className="bg-background rounded-3xl border-2 border-duo-swan p-8 md:p-12">
          <div className="space-y-8 mb-12">
            <Message type="user">
              <div className="space-y-2">
                <p className="text-duo-eel font-bold text-lg">
                  I uploaded a voice note from my commute.
                </p>
                <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-2 py-1 text-xs font-black uppercase tracking-wider text-duo-wolf">
                  <Mic2 className="h-3 w-3 text-duo-green" />
                  03:12 recording
                </div>
              </div>
            </Message>

            <Message type="bot">
              <div className="space-y-3">
                <p className="text-duo-eel font-bold text-lg leading-relaxed">
                  I found one reminder in it: <span className="text-duo-blue">attend the product review meeting today at 5 PM</span>. 
                  I can draft the calendar event once your calendar connector is enabled.
                </p>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-black text-duo-wolf bg-muted px-2 py-1 rounded-lg uppercase tracking-wider">
                    <CalendarPlus className="w-3 h-3" /> calendar draft
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-duo-wolf bg-muted px-2 py-1 rounded-lg uppercase tracking-wider">
                    <Calendar className="w-3 h-3" /> from recording
                  </span>
                </div>
              </div>
            </Message>

            <Message type="user">
              <p className="text-duo-eel font-bold text-lg">What patterns do I repeat?</p>
            </Message>

            <Message type="bot">
              <div className="space-y-3">
                <p className="text-duo-eel font-bold text-lg leading-relaxed">
                  Over the past 6 months you're <span className="text-duo-green">most productive after morning workouts</span>. 
                  A pattern shows skipped meals during high-stress weeks.
                </p>
                <div className="flex flex-wrap gap-2">
                   <span className="inline-flex items-center gap-1 text-xs font-black text-duo-wolf bg-muted px-2 py-1 rounded-lg uppercase tracking-wider">
                    <Check className="w-3 h-3" /> verified insight
                  </span>
                </div>
              </div>
            </Message>
          </div>

          <div className="pt-8 border-t-2 border-duo-swan flex justify-center">
            <Button variant="duolingo" size="lg" className="w-full max-w-sm">
              CONTINUE SESSION
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
