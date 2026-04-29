import { auth } from "@/lib/auth";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { Features } from "@/components/landing/Features";
import { Demo } from "@/components/landing/Demo";
import { CTA } from "@/components/landing/CTA";
import { headers } from "next/headers";

export default async function LandingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <Hero isSignedIn={Boolean(session)} />
      <Problem />
      <Solution />
      <Features />
      <Demo />
      <CTA />
    </>
  );
}
