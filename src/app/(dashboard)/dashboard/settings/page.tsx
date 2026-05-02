import {
  getUserPreferences,
  getNangoConnections,
  getAIProviders,
} from "@/actions/settings";
import { SettingsForm } from "@/components/dashboard/settings/settings-form";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Change your AI settings and account details.",
};

export default async function SettingsPage() {
  const user = await stackServerApp.getUser();
  if (!user) redirect("/join");

  const [preferences, connections, aiProvidersList] = await Promise.all([
    getUserPreferences(),
    getNangoConnections(),
    getAIProviders(),
  ]);

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:px-8">
        <header className="space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Options
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight">
              Settings
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Change your AI settings, connect apps, and more.
            </p>
          </div>
        </header>

        <SettingsForm
          initialData={preferences}
          connections={connections}
          aiProviders={aiProvidersList}
          userId={user.id}
        />
      </div>
    </div>
  );
}
