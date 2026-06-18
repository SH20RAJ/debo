import { BrainPage } from "@/components/brain/brain-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Second Brain | Debo",
  description: "Visualize and explore your interconnected memory graph",
};

export default function SecondBrainRoute() {
  return <BrainPage />;
}
