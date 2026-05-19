import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await stackServerApp.getUser();
  if (!user) redirect("/handler/sign-in");

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <section className="rounded-2xl border-2 border-border bg-card p-6">
          <h2 className="font-bold mb-4">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{user.primaryEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>{user.displayName || "Not set"}</span>
            </div>
          </div>
          <div className="mt-4">
            <user.Button />
          </div>
        </section>

        <section className="rounded-2xl border-2 border-border bg-card p-6">
          <h2 className="font-bold mb-4">AI Provider</h2>
          <p className="text-sm text-muted-foreground">
            Configure your AI provider in the environment variables. The app uses
            OpenAI-compatible APIs (NVIDIA NIM, OpenAI, etc.).
          </p>
          <div className="mt-3 text-sm font-mono text-muted-foreground bg-muted rounded-lg p-3">
            OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL
          </div>
        </section>
      </div>
    </div>
  );
}
