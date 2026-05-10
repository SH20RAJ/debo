import { stackServerApp } from "@/stack/server";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { UseCases } from "@/components/landing/UseCases";
import { Differentiation } from "@/components/landing/Differentiation";
import { Privacy } from "@/components/landing/Privacy";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";

export default async function LandingPage() {
  const user = await stackServerApp.getUser();

  return (
    <>
      <Hero isSignedIn={Boolean(user)} />
      <Problem />
      <Solution />
      <UseCases />
      <Differentiation />
      <Privacy />
      <FAQ />
      <CTA />
    </>
  );
}

