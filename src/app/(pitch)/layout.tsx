import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debo - Investor Pitch",
  description: "The AI companion that remembers everything",
};

export default function PitchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}