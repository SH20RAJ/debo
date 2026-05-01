import { stackServerApp } from "@/stack/server";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { Features } from "@/components/landing/Features";
import { Demo } from "@/components/landing/Demo";
import { CTA } from "@/components/landing/CTA";

export default async function LandingPage() {
  const user = await stackServerApp.getUser();

  return (
    <>
      <Hero isSignedIn={Boolean(user)} />
      <Problem />
      <Solution />
      <Features />
      <Demo />
      <CTA />
    </>
  );
}
