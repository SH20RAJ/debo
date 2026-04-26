"use client";

import { useState } from "react";
import { getNangoConnections, deleteNangoConnection, saveUserPreferences } from "@/actions/settings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, ShieldCheck, Link2, ExternalLink, Link2Off, Loader2, Sparkles, Box, Mic, Database, Save } from "lucide-react";
import Nango from "@nangohq/frontend";
import { useRouter } from "next/navigation";
import { PROVIDERS } from "@/config/providers";
import { ProviderCard } from "../overview/provider-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsForm({ 
    initialData, 
    connections = [], 
    aiProviders = [],
    userId 
}: { 
    initialData?: { 
        activeProvider?: string | null,
        mem0Key?: string | null,
        mem0Url?: string | null
    } | null,
    connections?: any[],
    aiProviders?: any[],
    userId: string
}) {
    const [isConnecting, setIsConnecting] = useState<string | null>(null);
    const [isSavingMem0, setIsSavingMem0] = useState(false);
    const [mem0Key, setMem0Key] = useState(initialData?.mem0Key || "");
    const [mem0Url, setMem0Url] = useState(initialData?.mem0Url || "");
    
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

    const handleSaveMem0 = async () => {
        setIsSavingMem0(true);
        try {
            await saveUserPreferences({
                mem0Key,
                mem0Url
            });
            toast.success("Memory settings updated.");
            router.refresh();
        } catch (e) {
            toast.error("Failed to save memory settings.");
        } finally {
            setIsSavingMem0(false);
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
                        <TabsTrigger value="memory" className="gap-2 rounded-md">
                            <Database className="h-4 w-4" /> Memory (Mem0)
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

                <TabsContent value="memory" className="space-y-6 mt-0">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight">Intelligence Context (Mem0)</h2>
                        <p className="text-muted-foreground">Configure your persistent memory layer. Use our managed service or bring your own.</p>
                    </div>

                    <Card className="max-w-2xl border-none bg-muted/30">
                        <CardHeader>
                            <CardTitle className="text-lg">Mem0 Configuration</CardTitle>
                            <CardDescription>Enter your Mem0 API key and optional custom host URL for self-hosted instances.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="mem0-key">API Key</Label>
                                <Input 
                                    id="mem0-key" 
                                    type="password" 
                                    placeholder="m0-..." 
                                    value={mem0Key}
                                    onChange={(e) => setMem0Key(e.target.value)}
                                    className="rounded-xl"
                                />
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Leave empty to use system default</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mem0-url">Custom Host URL (Optional)</Label>
                                <Input 
                                    id="mem0-url" 
                                    placeholder="https://your-mem0-instance.com" 
                                    value={mem0Url}
                                    onChange={(e) => setMem0Url(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t/50 pt-6">
                            <Button 
                                onClick={handleSaveMem0} 
                                disabled={isSavingMem0}
                                className="rounded-xl gap-2"
                            >
                                {isSavingMem0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Memory Settings
                            </Button>
                        </CardFooter>
                    </Card>
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
                                <Card key={integration.id} className="overflow-hidden transition-all hover:shadow-sm border-none bg-muted/30">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 overflow-hidden rounded-xl border bg-background p-1.5 shadow-sm">
                                                <img src={integration.icon} alt={integration.name} className="h-full w-full object-contain" />
                                            </div>
                                            <CardTitle className="text-base font-bold">{integration.name}</CardTitle>
                                        </div>
                                        <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <CardDescription className="text-xs font-medium">
                                            {connected ? `Active Connection` : "Ready to synchronize"}
                                        </CardDescription>
                                    </CardContent>
                                    <CardFooter className="bg-background/50 border-t/50 px-4 py-3 flex justify-end">
                                        {connected ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs font-bold uppercase tracking-widest text-destructive hover:text-destructive hover:bg-destructive/10"
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
                                                className="text-xs font-bold uppercase tracking-widest rounded-xl"
                                                disabled={loading}
                                                onClick={() => handleConnect(integration.id)}
                                            >
                                                {loading ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                                        Authorize
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
                    
                    <Card className="border-none bg-muted/30 max-w-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg">LiveKit Configuration</CardTitle>
                            <CardDescription>Managed via project environment variables.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                Your voice agent is currently using the cloud-native LiveKit instance. 
                                Support for custom LiveKit URLs and granular voice profiles (Deepgram, Cartesia) is coming in the next update.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex items-center justify-center pt-8">
                <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 bg-muted/50 px-6 py-3 rounded-full border border-border/50 shadow-inner">
                    <ShieldCheck className="h-4 w-4 mr-2 text-emerald-500/50" />
                    Secure AES-256 Cloud Storage
                </div>
            </div>
        </div>
    );
}
