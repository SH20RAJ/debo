import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How we handle your data and memory engine privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="relative py-20 lg:py-32 overflow-hidden bg-background">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground font-heading">
            Privacy Policy
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Your memories are your most private asset. We built Debo from the ground up to respect, protect, and isolate your personal data.
          </p>
        </div>

        <div className="bg-card border border-border shadow-sm rounded-3xl p-8 sm:p-12">
          <div className="prose prose-neutral dark:prose-invert prose-lg max-w-none text-muted-foreground">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">1</span>
                Data Sovereignty
              </h2>
              <p>
                Debo is built on the principle of personal memory sovereignty. Your journals, reflections, and extracted memories are yours. We do not sell your data or use it to train global models that could compromise your privacy. Our architecture ensures your thoughts remain entirely under your control.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">2</span>
                Memory Extraction
              </h2>
              <p>
                When you journal, our engine extracts key facts and patterns to build your personal memory database. This process is strictly isolated to your user account and uses secure, encrypted storage. No other user or entity can query or access your extracted memory graph.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">3</span>
                AI Processing
              </h2>
              <p>
                We use advanced Edge AI and specialized models to provide personal insights. These requests are processed seamlessly in real-time. Critically, your prompts and personal data are not retained by underlying model providers to improve their global services beyond the immediate scope of generating your private insights.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">4</span>
                Security Practices
              </h2>
              <p>
                We implement industry-standard security measures to protect your data. This includes robust encryption in transit and at rest, secure database connections, and stringent access controls to ensure only you have access to your timeline and memory vaults.
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
