import { Hero } from "@/components/landing/Hero";
import { Comparison } from "@/components/landing/Comparison";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { UseCases } from "@/components/landing/UseCases";
import { CharacterMemory } from "@/components/landing/CharacterMemory";
import { Differentiation } from "@/components/landing/Differentiation";
import { Privacy } from "@/components/landing/Privacy";
import { SocialProof } from "@/components/landing/SocialProof";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Comparison />
      <Problem />
      <Solution />
      <CharacterMemory />
      <UseCases />
      <Differentiation />
      <Privacy />
      <SocialProof />
      <FAQ />
      <CTA />
    </>
  );
}
