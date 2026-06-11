import { DecisionsPage } from "@/components/decisions/decisions-page";

export const metadata = {
  title: "Decisions",
  description: "Your decision log extracted from memory.",
};

export default function DecisionsRoute() {
  return <DecisionsPage />;
}
