import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Debo",
  description: "Guidelines for using the Debo Memory Engine.",
};

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-20 px-6">
      <h1 className="text-4xl font-bold tracking-tight font-heading mb-8">Terms of Service</h1>
      
      <div className="prose prose-neutral dark:prose-invert space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
          <p>
            By using Debo, you agree to these terms. Debo is a personal journaling and memory enhancement tool designed to help you remember and reflect on your life.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">2. Your Content</h2>
          <p>
            You retain all rights to the content you create. You grant Debo a limited license to process this content solely for the purpose of providing the memory extraction and search features you interact with.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">3. Proper Use</h2>
          <p>
            You agree not to use the service for any illegal purposes or to store harmful content. The memory engine is designed for personal use; automated harvesting of AI-generated insights is prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">4. Limitation of Liability</h2>
          <p>
            Debo is provided "as is". While we strive for absolute accuracy in memory extraction, the AI may occasionally generate inaccuracies. We are not liable for any decisions made based on AI-synthesized memories.
          </p>
        </section>

        <footer className="pt-10 border-t text-sm">
          Last Updated: April 28, 2026
        </footer>
      </div>
    </div>
  );
}
