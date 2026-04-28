import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Search, Sparkles, MessagesSquare } from "lucide-react";

export function Features() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="rounded-2xl border-none shadow-sm bg-background">
            <CardHeader>
              <Brain className="w-8 h-8 text-primary mb-4" />
              <CardTitle className="text-xl">AI Memory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Debo ingests your journal entries and builds a cohesive understanding of your life, thoughts, and habits over time.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm bg-background">
            <CardHeader>
              <Search className="w-8 h-8 text-primary mb-4" />
              <CardTitle className="text-xl">Smart Search</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Don't remember the exact keyword? Just search conceptually. Find exactly what you felt or did, instantly.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm bg-background">
            <CardHeader>
              <Sparkles className="w-8 h-8 text-primary mb-4" />
              <CardTitle className="text-xl">Daily Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Wake up to AI-generated reflections on your past weeks. See trends you never knew existed.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm bg-background">
            <CardHeader>
              <MessagesSquare className="w-8 h-8 text-primary mb-4" />
              <CardTitle className="text-xl">Life Query</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Treat your journals like a database you can chat with. "What was my main focus last January?" — answered.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
