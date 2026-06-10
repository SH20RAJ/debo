import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Product } from "@/components/landing/Product";
import { UseCases } from "@/components/landing/UseCases";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Privacy } from "@/components/landing/Privacy";
import { FounderNote } from "@/components/landing/FounderNote";
import { FinalCTA } from "@/components/landing/FinalCTA";

export const metadata: Metadata = {
  title: "Debo | Your Life’s MCP",
  description:
    "The foundational memory layer for personal intelligence. Build a searchable knowledge graph and give your personal AI the context of your entire life.",
  openGraph: {
    title: "Debo: The Memory Context Protocol for Humans",
    description:
      "AI without memory is temporary. Debo provides the permanent context layer that turns your history into a searchable personal intelligence protocol.",
  },
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Problem />
      <Product />
      <UseCases />
      <HowItWorks />
      <Privacy />
      <FounderNote />
      <FinalCTA />
    </>
  );
}
