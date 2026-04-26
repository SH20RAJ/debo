"use client";

import { useState } from "react";
import { getNangoConnections, deleteNangoConnection } from "@/actions/settings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, ShieldCheck, Link2, ExternalLink, Link2Off, Loader2, Sparkles, Box, Mic } from "lucide-react";
import Nango from "@nangohq/frontend";
import { useRouter } from "next/navigation";
import { PROVIDERS } from "@/config/providers";
import { ProviderCard } from "../overview/provider-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsForm({ 
    initialData, 
    connections = [], 
    aiProviders = [],
    userId 
}: { 
    initialData?: { 
        activeProvider?: string | null 
    } | null,
    connections?: any[],
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
        } catch (error) {
            toast.error("Failed to disconnect.");
        }
    };

    const isConnected = (provider: string) => connections.some(c => c.providerConfigKey === provider);

    const getSavedConfig = (providerId: string) => {
        return aiProviders.find(p => p.providerId === providerId);
    };

    return (
        <div className="space-y-8">
            <Tabs defaultValue="ai" className="w-full space-y-6">
                <div className="flex justify-center md:justify-start">
                    <TabsList className="p-1">
                        <TabsTrigger value="ai" className="gap-2 rounded-md">
                            <Sparkles className="h-4 w-4" /> AI Providers
                        </TabsTrigger>
                        <TabsTrigger value="integrations" className="gap-2 rounded-md">
                            <Box className="h-4 w-4" /> Integrations
                        </TabsTrigger>
                        <TabsTrigger value="voice" className="gap-2 rounded-md">
                            <Mic className="h-4 w-4" /> Voice Settings
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="ai" className="space-y-6 mt-0">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold tracking-tight">AI Model Providers</h2>
                            <p className="text-muted-foreground">Enable and configure the intelligence that powers your companion.</p>
                        </div>
                    </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

                <TabsContent value="integrations" className="space-y-6 mt-0">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight">Integrations & Telemetry</h2>
                        <p className="text-muted-foreground">Sync your life data from external apps to give Debo context.</p>
                    </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        { id: "google-calendar", name: "Google Calendar", icon: "https://www.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png" },
                        { id: "google-mail", name: "Gmail", icon: "https://ssl.gstatic.com/ui/v1/icons/mail/images/2/itp_google_mail_2x.png" },
                        { id: "slack", name: "Slack", icon: "https://a.slack-edge.com/80588/img/services/slack_512.png" },
                        { id: "notion", name: "Notion", icon: "https://www.notion.so/images/logo-ios.png" },
                    ].map((integration) => {
                        const connected = isConnected(integration.id);
                        const loading = isConnecting === integration.id;

                        return (
                            <Card key={integration.id} className="overflow-hidden transition-all hover:shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 overflow-hidden rounded-lg border bg-background p-1.5">
                                            <img src={integration.icon} alt={integration.name} className="h-full w-full object-contain" />
                                        </div>
                                        <CardTitle className="text-base">{integration.name}</CardTitle>
                                    </div>
                                    <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                                </CardHeader>
                                <CardContent className="pb-4">
                                    <CardDescription className="text-xs">
                                        {connected ? `Connected as ${userId.slice(0, 8)}...` : "Authorize Debo to sync data."}
                                    </CardDescription>
                                </CardContent>
                                <CardFooter className="bg-muted/5 border-t px-4 py-3 flex justify-end">
                                    {connected ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDisconnect(integration.id)}
                                        >
                                            <Link2Off className="h-3.5 w-3.5 mr-1" />
                                            Disconnect
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            disabled={loading}
                                            onClick={() => handleConnect(integration.id)}
                                        >
                                            {loading ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <>
                                                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                                    Connect
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
                </TabsContent>

                <TabsContent value="voice" className="space-y-6 mt-0">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight">Voice Agent Settings</h2>
                        <p className="text-muted-foreground">Configure LiveKit connection and voice preferences.</p>
                    </div>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>LiveKit Configuration</CardTitle>
                            <CardDescription>Currently under construction in Phase 4.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Settings for STT (Deepgram), TTS (Cartesia), and SIP telephony will be available here soon.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex items-center justify-center pt-8">
                <div className="flex items-center text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full border border-border">
                    <ShieldCheck className="h-4 w-4 mr-2 text-emerald-500" />
                    All API keys are encrypted with AES-256-GCM before storage.
                </div>
            </div>
        </div>
    );
}
