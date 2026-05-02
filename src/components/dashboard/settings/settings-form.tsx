"use client";

import { useState } from "react";
import { deleteNangoConnection } from "@/actions/settings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2, Sparkles, Box, Mic } from "lucide-react";
import Nango from "@nangohq/frontend";
import { useRouter } from "next/navigation";
import { PROVIDERS } from "@/config/providers";
import { ProviderCard } from "./provider-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsForm({ 
    initialData, 
    connections = [], 
    aiProviders = [],
    userId 
}: { 
    initialData?: { 
        activeProvider?: string | null,
    } | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connections?: any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    aiProviders?: any[],
    userId: string
}) {
    const [isConnecting, setIsConnecting] = useState<string | null>(null);
    
    const router = useRouter();

    const handleConnect = async (providerConfigKey: string) => {
        if (!process.env.NEXT_PUBLIC_NANGO_PUBLIC_KEY) {
            toast.error("Nango Public Key not configured.");
            return;
        }

        setIsConnecting(providerConfigKey);
        try {
            const nango = new Nango({ publicKey: process.env.NEXT_PUBLIC_NANGO_PUBLIC_KEY });
            await nango.auth(providerConfigKey, userId);
            toast.success(`Connected to ${providerConfigKey}!`);
            router.refresh();
        } catch (error) {
            console.error("Nango Auth Error:", error);
            toast.error(`Failed to connect to ${providerConfigKey}.`);
        } finally {
            setIsConnecting(null);
        }
    };

    const handleDisconnect = async (providerConfigKey: string) => {
        try {
            const ok = await deleteNangoConnection(providerConfigKey);
            if (ok) {
                toast.success(`Disconnected from ${providerConfigKey}.`);
                router.refresh();
            }
        } catch (_error) {
            toast.error("Failed to disconnect.");
        }
    };

    const isConnected = (provider: string) => connections.some(c => c.providerConfigKey === provider);

    const getSavedConfig = (providerId: string) => {
        return aiProviders.find(p => p.providerId === providerId);
    };

    return (
        <div className="space-y-10">
            <Tabs defaultValue="ai" className="w-full space-y-8">
                <div className="flex justify-center md:justify-start">
                    <TabsList className="h-11 bg-muted/20 border border-border p-1 rounded-xl">
                        <TabsTrigger value="ai" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs font-medium uppercase tracking-wider px-4">
                            <Sparkles className="h-3.5 w-3.5" /> AI Models
                        </TabsTrigger>
                        <TabsTrigger value="integrations" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs font-medium uppercase tracking-wider px-4">
                            <Box className="h-3.5 w-3.5" /> Connections
                        </TabsTrigger>
                        <TabsTrigger value="voice" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs font-medium uppercase tracking-wider px-4">
                            <Mic className="h-3.5 w-3.5" /> Voice
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="ai" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold tracking-tight">AI Settings</h2>
                        <p className="text-sm text-muted-foreground">Choose the AI that powers Debo.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {PROVIDERS.map((provider) => (
                            <ProviderCard
                                key={provider.id}
                                config={provider}
                                savedConfig={getSavedConfig(provider.id)}
                                isActive={initialData?.activeProvider === provider.id}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="integrations" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold tracking-tight">App Connections</h2>
                        <p className="text-sm text-muted-foreground">Connect your favorite apps to give Debo more context.</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { id: "google-calendar", name: "Google Calendar", icon: "https://www.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png" },
                            { id: "google-mail", name: "Gmail", icon: "https://ssl.gstatic.com/ui/v1/icons/mail/images/2/itp_google_mail_2x.png" },
                            { id: "slack", name: "Slack", icon: "https://a.slack-edge.com/80588/img/services/slack_512.png" },
                            { id: "notion", name: "Notion", icon: "https://www.notion.so/images/logo-ios.png" },
                        ].map((integration) => {
                            const connected = isConnected(integration.id);
                            const loading = isConnecting === integration.id;

                            return (
                                <div key={integration.id} className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/20">
                                    <div className="p-5 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 overflow-hidden rounded-xl border border-border bg-background p-2">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={integration.icon} alt={integration.name} className="h-full w-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                                            </div>
                                            <span className="text-sm font-semibold tracking-tight">{integration.name}</span>
                                        </div>
                                        <div className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-muted-foreground/20'}`} />
                                    </div>
                                    
                                    <div className="px-5 py-4 border-t border-border bg-muted/10 flex items-center justify-between mt-auto">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                            {connected ? `Active` : "Inactive"}
                                        </span>
                                        {connected ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDisconnect(integration.id)}
                                            >
                                                Disconnect
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest border-border rounded-lg bg-background"
                                                disabled={loading}
                                                onClick={() => handleConnect(integration.id)}
                                            >
                                                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Authorize"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="voice" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold tracking-tight">Voice Settings</h2>
                        <p className="text-sm text-muted-foreground">Change how your voice agent works.</p>
                    </div>
                    
                    <div className="rounded-2xl border border-border bg-muted/10 p-6 max-w-2xl">
                        <h3 className="text-sm font-semibold mb-2">System Info</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            We're using a fast cloud system for voice. More options are coming soon!
                        </p>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex items-center justify-center pt-10 border-t border-border/40">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 px-6 py-2 rounded-full border border-border bg-muted/5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Your data is encrypted
                </div>
            </div>
        </div>
    );
}
