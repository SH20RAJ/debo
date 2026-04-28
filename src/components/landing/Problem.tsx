import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Problem() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The old way is broken.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="rounded-2xl border-none shadow-sm bg-background">
            <CardHeader>
              <CardTitle className="text-xl">You forget patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your life is full of recurring themes, but human memory is scattered. You lose track of the big picture.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-none shadow-sm bg-background">
            <CardHeader>
              <CardTitle className="text-xl">Notes are static</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Traditional journals just sit there. They don't talk back, they don't connect the dots, they just store text.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-none shadow-sm bg-background">
            <CardHeader>
              <CardTitle className="text-xl">No real intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You spend hours organizing tags and folders instead of actually understanding your own life and habits.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
