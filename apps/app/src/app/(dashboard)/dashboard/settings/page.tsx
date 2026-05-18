import { getDeboSettings } from "@/actions/settings";
import { SettingsForm } from "@/components/dashboard/settings/settings-form";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Tune how Debo talks with you.",
};

export default async function SettingsPage() {
  const user = await stackServerApp.getUser();
  if (!user) redirect("/join");

  const settings = await getDeboSettings(user.id);

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-10 lg:px-8">
        <header className="space-y-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Control tone
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Settings
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Choose the name and tone Debo uses in chat, talk, and MCP answers.
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
            {user.primaryEmail || "Signed in"}
          </div>
        </header>

        <SettingsForm
          initialData={{
            ...settings,
            userDisplayName: settings.userDisplayName || (user as { displayName?: string }).displayName || "",
          }}
        />
      </div>
    </div>
  );
}
