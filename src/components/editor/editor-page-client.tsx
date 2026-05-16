"use client";

import dynamic from "next/dynamic";
import { Toaster } from "sonner";

const PlateEditor = dynamic(
  () => import("@/components/editor/plate-editor").then((mod) => mod.PlateEditor),
  {
    ssr: false,
    loading: () => <div className="h-screen w-full bg-background" />,
  },
);

export function EditorPageClient() {
  return (
    <div className="h-screen w-full">
      <PlateEditor />
      <Toaster />
    </div>
  );
}
