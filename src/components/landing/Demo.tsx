"use client";

import { User, Bot, Search, TrendingUp, Calendar, Sparkles } from "lucide-react";

interface MessageProps {
  type: "user" | "bot";
  children: React.ReactNode;
  typing?: boolean;
}

function Message({ type, children, typing }: MessageProps) {
  const isUser = type === "user";
  return (
    <div className={`flex items-start gap-4 ${typing ? "animate-in fade-in slide-in-from-bottom-2 duration-500" : ""}`}>
      <div className={`shrink-0 p-2 rounded-full ${isUser ? "bg-muted" : "bg-primary/10"}`}>
        {isUser ? (
          <User className="w-5 h-5" />
        ) : (
          <Bot className="w-5 h-5 text-primary" />
        )}
      </div>
      <div className={`px-4 py-3 rounded-2xl ${isUser ? "bg-muted rounded-tl-sm" : "bg-primary/5 border border-primary/10 rounded-tl-sm"}`}>
        {children}
      </div>
    </div>
  );
}

export function Demo() {
  return (
    <section id="demo" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-muted/30" />
      <div className="absolute top-0 left-1/4 w-px h-32 bg-gradient-to-b from-primary/50 to-transparent" />
      <div className="absolute top-0 right-1/4 w-px h-32 bg-gradient-to-b from-primary/50 to-transparent" />
      
      <div className="container mx-auto max-w-6xl px-6 relative">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6">
            <Search className="w-4 h-4" />
            <span className="text-sm font-medium">Live Demo</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Real queries. Real context. <span className="text-primary">Real evidence.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Ask a question and get answers with citations from your history. This is what conversing with your past looks like.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl border border-border bg-background/80 backdrop-blur-sm p-8 shadow-2xl shadow-primary/5">
            <div className="flex items-center gap-3 pb-6 border-b border-border/50 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Debo Assistant</h3>
                <p className="text-xs text-muted-foreground">Ready to explore your memories</p>
              </div>
              <div className="ml-auto flex gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <Message type="user">
                <p className="text-foreground">What did I do last week?</p>
              </Message>

              <Message type="bot">
                <p className="text-foreground leading-relaxed">
                  Last week, you focused on <span className="text-primary font-medium">finishing the new design system</span>. 
                  You noted burnout on Thursday but took a long hike Saturday, which helped.
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                    <Calendar className="w-3 h-3" /> Apr 21
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                    <Calendar className="w-3 h-3" /> Apr 18
                  </span>
                </div>
              </Message>

              <Message type="user">
                <p className="text-foreground">What patterns do I repeat?</p>
              </Message>

              <Message type="bot">
                <p className="text-foreground leading-relaxed">
                  Over the past 6 months you're <span className="text-primary font-medium">most productive after morning workouts</span>. 
                  A pattern shows skipped meals during high-stress weeks, often followed by poor sleep.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                    <TrendingUp className="w-3 h-3" /> 3 sources
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                    <Calendar className="w-3 h-3" /> Mar 12
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                    <Calendar className="w-3 h-3" /> Feb 3
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                    <Calendar className="w-3 h-3" /> Jan 7
                  </span>
                </div>
              </Message>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                This is a demo. Your actual conversations will reference your own journal entries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
