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
  title: "Debo — Private AI Memory for Notes, Voice, Tasks & Research",
  description:
    "Debo helps you capture voice notes, journals, links, tasks, and conversations, then recall them later with private, source-backed AI memory.",
  openGraph: {
    title: "Debo — Your Private AI Memory Layer",
    description:
      "Capture your thoughts, notes, tasks, and conversations. Ask your past with source-backed answers.",
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
