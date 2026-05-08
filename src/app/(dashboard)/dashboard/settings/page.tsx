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
  description: "Manage Debo apps, AI, capture, and voice settings.",
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
    <div className="flex-1 bg-duo-polar">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 lg:px-8">
        <header className="duo-card grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-duo-wolf">
              Control room
            </div>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-duo-eel md:text-6xl">
              Settings
            </h1>
            <p className="mt-3 max-w-2xl text-base font-bold leading-7 text-duo-wolf">
              Connect apps, pick your AI, and keep capture ready.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-duo-feather bg-duo-green/10 px-4 py-3 text-sm font-black text-duo-green">
            {user.primaryEmail || "Signed in"}
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
