import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Search, Sparkles, MessagesSquare } from "lucide-react";

export function Features() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="rounded-2xl border-none shadow-sm bg-background">
            <CardHeader>
              <Brain className="w-8 h-8 text-primary mb-4" />
              <CardTitle className="text-xl">AI Memory Engine</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Debo turns entries into durable memories, surfacing what matters across time.
              </p>
              <p className="mt-3 text-sm text-muted-foreground/80">Example: &quot;I prefer deep work on Tuesdays&quot; saved as a preference.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm bg-background">
            <CardHeader>
              <Search className="w-8 h-8 text-primary mb-4" />
              <CardTitle className="text-xl">Ask Your Life</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Ask natural questions about your past and get evidence-backed answers.</p>
              <p className="mt-3 text-sm text-muted-foreground/80">Example: &quot;When was I happiest this year?&quot; &rarr; timeline + citations.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm bg-background">
            <CardHeader>
              <Sparkles className="w-8 h-8 text-primary mb-4" />
              <CardTitle className="text-xl">Pattern Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Automatically surface habits and recurring signals from your entries.</p>
              <p className="mt-3 text-sm text-muted-foreground/80">Example: recurring stress spikes before deadlines.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm bg-background">
            <CardHeader>
              <MessagesSquare className="w-8 h-8 text-primary mb-4" />
              <CardTitle className="text-xl">Life Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">See your months and years at a glance with curated summaries.</p>
              <p className="mt-3 text-sm text-muted-foreground/80">Example: monthly rollups and major event highlights.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm bg-background">
            <CardHeader>
              <Brain className="w-8 h-8 text-primary mb-4" />
              <CardTitle className="text-xl">Memory Graph</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Explore connections between people, topics, and emotions over time.</p>
              <p className="mt-3 text-sm text-muted-foreground/80">Example: who appears most in your progress stories.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm bg-background">
            <CardHeader>
              <Sparkles className="w-8 h-8 text-primary mb-4" />
              <CardTitle className="text-xl">Proactive Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Receive actionable nudges and advice based on your history.</p>
              <p className="mt-3 text-sm text-muted-foreground/80">Example: &quot;You do best work mornings; schedule focus blocks then.&quot;</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
