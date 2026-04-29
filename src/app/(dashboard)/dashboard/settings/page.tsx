import { getUserPreferences, getNangoConnections, getAIProviders } from "@/actions/settings";
import { SettingsForm } from "@/components/dashboard/settings/settings-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuration",
  description: "Manage your AI providers and personal preferences.",
};

export default async function SettingsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/join");

    const [preferences, connections, aiProvidersList] = await Promise.all([
        getUserPreferences(),
        getNangoConnections(),
        getAIProviders()
    ]);

    return (
        <div className="flex-1 bg-background">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:px-8">
                <header className="space-y-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        Preferences
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-semibold tracking-tight">Configuration</h1>
                        <p className="max-w-2xl text-lg text-muted-foreground">
                            Manage your AI providers, integrations, and personal settings.
                        </p>
                    </div>
                </header>

                <SettingsForm 
                    initialData={preferences} 
                    connections={connections} 
                    aiProviders={aiProvidersList}
                    userId={session.user.id}
                />
            </div>
        </div>
    );
}
