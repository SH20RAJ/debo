import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debo | The AI that Remembers Everything",
  description: "The memory OS for thinkers and builders. Sync your thoughts and 130+ apps into one private intelligence network.",
};

// This is strictly a Server Component, as requested.
export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <HeroSection />
      <FeaturesSection />
    </div>
  );
}
