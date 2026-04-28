import { Card } from "@/components/ui/card";
import { User, Bot } from "lucide-react";

export function Demo() {
  return (
    <section id="demo" className="py-24 md:py-32">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Real queries. Real context. Real evidence.</h2>
          <p className="mt-4 text-lg text-muted-foreground">Ask a question and get answers with citations from your history.</p>
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
                <p>Last week, you focused on finishing the new design system. You noted burnout on Thursday but took a long hike Saturday, which helped. Citations: Apr 21, Apr 18.</p>
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
                <p>Over the past 6 months you’re most productive after morning workouts. A pattern shows skipped meals during high-stress weeks, often followed by poor sleep. Citations: Mar 12, Feb 3, Jan 7.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
