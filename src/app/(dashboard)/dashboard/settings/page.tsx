import { getUserPreferences, getNangoConnections, getAIProviders } from "./actions";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");

    const [preferences, connections, aiProvidersList] = await Promise.all([
        getUserPreferences(),
        getNangoConnections(),
        getAIProviders()
    ]);

    return (
        <div className="max-w-5xl mx-auto space-y-10 px-6 py-8 md:px-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground text-lg">Manage your AI providers, integrations, and global preferences.</p>
            </div>

            <SettingsForm 
                initialData={preferences} 
                connections={connections} 
                aiProviders={aiProvidersList}
                userId={session.user.id}
            />
        </div>
    );
}
