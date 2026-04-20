import { HeroSection } from "@/components/landing/hero-section";

// This is strictly a Server Component, as requested.
export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <HeroSection />
    </div>
  );
}
