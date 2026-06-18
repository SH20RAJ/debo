import { TwinPage } from "@/components/twin/twin-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Twin | Debo",
  description: "Configure your personal AI twin, tone settings, and run sandbox simulations",
};

export default function DigitalTwinRoute() {
  return <TwinPage />;
}
