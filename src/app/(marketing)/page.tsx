import { stackServerApp } from "@/stack/server";
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

export default async function LandingPage() {
  const user = await stackServerApp.getUser();

  return (
    <>
      <Hero isSignedIn={Boolean(user)} />
      <Comparison />
      <Problem />
      <Solution />
      <CharacterMemory />
      <UseCases />
      <Differentiation />
      <Privacy />
      <Differentiation />
      
      <SocialProof />
      <FAQ />
      <CTA />
    </>
  );
}


