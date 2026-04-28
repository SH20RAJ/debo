import { Card } from "@/components/ui/card";
import { User, Bot } from "lucide-react";

export function Demo() {
  return (
    <section id="demo" className="py-24 md:py-32">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ask your life anything.</h2>
          <p className="mt-4 text-lg text-muted-foreground">Experience true personal intelligence.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="rounded-2xl border border-border shadow-lg bg-background p-6 space-y-6 flex flex-col">
            <div className="flex items-start gap-4">
              <div className="bg-muted p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm text-foreground">
                <p>What did I do last week?</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="bg-primary/5 px-4 py-3 rounded-2xl rounded-tl-sm text-foreground border border-primary/10">
                <p>Last week, you were heavily focused on finishing the new design system for work. You mentioned feeling a bit burnt out on Thursday, but took a long hike on Saturday which helped clear your head. You also started reading "Dune".</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-muted p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm text-foreground">
                <p>What patterns do I repeat?</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="bg-primary/5 px-4 py-3 rounded-2xl rounded-tl-sm text-foreground border border-primary/10">
                <p>Looking at the past 6 months, you tend to feel most productive when you work out in the morning. However, you also have a pattern of skipping meals when stressed, which often leads to poor sleep the following night.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
