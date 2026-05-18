import type { Metadata } from "next";

import { CaptureStudio } from "@/components/dashboard/capture/capture-studio";

export const metadata: Metadata = {
  title: "Capture",
  description: "Record audio, video, and page captures into Debo journals.",
};

export default function CapturePage() {
  return <CaptureStudio />;
}
