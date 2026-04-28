import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Debo",
  description: "How we handle your data and memory engine privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-20 px-6">
      <h1 className="text-4xl font-bold tracking-tight font-heading mb-8">Privacy Policy</h1>
      
      <div className="prose prose-neutral dark:prose-invert space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">1. Data Sovereignty</h2>
          <p>
            Debo is built on the principle of personal memory sovereignty. Your journals, reflections, and extracted memories are yours. We do not sell your data or use it to train global models that could compromise your privacy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">2. Memory Extraction</h2>
          <p>
            When you journal, our engine extracts key facts and patterns to build your personal memory database. This process is isolated to your user account and uses secure, encrypted storage (Neon and Mem0).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">3. AI Processing</h2>
          <p>
            We use Cloudflare's Edge AI and specialized models to provide insights. These requests are processed in real-time and are not used by the model providers to improve their services beyond the immediate scope of your query.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">4. Security</h2>
          <p>
            We implement industry-standard security measures to protect your data, including end-to-end encryption for sensitive identifiers and secure database connections.
          </p>
        </section>

        <footer className="pt-10 border-t text-sm">
          Last Updated: April 28, 2026
        </footer>
      </div>
    </div>
  );
}
