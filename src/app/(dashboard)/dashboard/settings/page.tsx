import { getUserPreferences } from "./actions";
import { SettingsForm } from "@/components/dashboard/settings-form";

export default async function SettingsPage() {
    const preferences = await getUserPreferences();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your app preferences and integration connections.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* BYOK Section */}
                <div className="md:col-span-2">
                    <SettingsForm initialData={preferences} />
                </div>
            </div>
        </div>
    );
}
