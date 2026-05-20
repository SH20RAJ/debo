import dynamic from "next/dynamic";

const SettingsPage = dynamic(
  () => import("@/components/settings/settings-page").then((m) => m.SettingsPage),
  { ssr: false, loading: () => <div className="p-8"><div className="h-8 w-32 bg-muted rounded animate-pulse" /></div> }
);

export default function SettingsRoute() {
  return <SettingsPage />;
}
