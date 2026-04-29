import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Debo",
  description: "Guidelines for using the Debo Memory Engine.",
};

export default function TermsPage() {
  return (
    <div className="relative py-20 lg:py-32 overflow-hidden bg-background">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground font-heading">
            Terms of Service
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully. By using Debo, you agree to abide by our ground rules designed to foster a safe, accurate memory environment.
          </p>
        </div>

        <div className="bg-card border border-border shadow-sm rounded-3xl p-8 sm:p-12">
          <div className="prose prose-neutral dark:prose-invert prose-lg max-w-none text-muted-foreground">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">1</span>
                Acceptance of Terms
              </h2>
              <p>
                By accessing and using Debo, you agree to be bound by these terms. Debo operates as a personal journaling and advanced memory enhancement tool engineered to help you remember, reflect, and grow.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">2</span>
                Your Content Rights
              </h2>
              <p>
                You retain absolute copyright and all other rights to the content you create. You grant Debo a limited, secure license to process this content strictly for the explicit purpose of providing the memory extraction, timeline generation, and contextual search features you actively utilize.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">3</span>
                Proper Platform Use
              </h2>
              <p>
                You agree not to use the service for any illegal purposes or to store maliciously harmful content. The Debo memory engine is engineered for individual, personal use; any unauthorized automated harvesting, scraping, or misuse of AI-generated insights is strictly prohibited.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">4</span>
                Limitation of Liability
              </h2>
              <p>
                Debo and its features are provided &quot;as is&quot;. While our AI models strive for absolute accuracy in parsing and recalling memory extraction, the models may occasionally hallucinate or generate inaccuracies. We are not legally or ethically liable for any actions or decisions you make based on AI-synthesized memories.
              </p>
            </section>

            <footer className="pt-8 mt-8 border-t border-border flex items-center justify-between text-sm font-medium">
              <span>Last Updated</span>
              <span className="text-foreground">April 29, 2026</span>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
