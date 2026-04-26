import { getUserPreferences, getNangoConnections, getAIProviders } from "./actions";
import { SettingsForm } from "@/components/dashboard/settings/settings-form";
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
        <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-12 space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <SettingsForm 
                initialData={preferences} 
                connections={connections} 
                aiProviders={aiProvidersList}
                userId={session.user.id}
            />
        </div>
    );
}
