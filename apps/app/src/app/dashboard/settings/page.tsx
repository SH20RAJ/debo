"use client";

import dynamic from "next/dynamic";

function SettingsLoading() {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="h-8 w-32 bg-muted rounded animate-pulse mb-6" />
      <div className="space-y-4">
        <div className="h-40 bg-muted rounded-2xl animate-pulse" />
        <div className="h-40 bg-muted rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}

const SettingsContent = dynamic(
  () => import("@/components/settings/settings-page").then((m) => m.SettingsPage),
  { ssr: false, loading: SettingsLoading }
);

export default function SettingsPage() {
  return <SettingsContent />;
}
