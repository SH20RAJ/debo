import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debo | Your Life's Memory Engine",
  description: "AI that remembers your life so you can ask anything about it. High-retention journaling and personal intelligence for builders.",
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
