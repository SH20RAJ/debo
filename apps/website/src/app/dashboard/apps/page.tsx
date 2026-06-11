import { DeboAppsPage } from "@/components/apps/debo-apps-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debo Apps",
  description: "Launch your private AI memory OS apps",
};

export const dynamic = "force-dynamic";

export default function DashboardAppsPage() {
  return (
    <div className="h-full">
      <DeboAppsPage />
    </div>
  );
}
