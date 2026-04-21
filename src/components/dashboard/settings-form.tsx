"use client";

import { useState } from "react";
import { saveUserPreferences } from "@/app/(dashboard)/dashboard/settings/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, ShieldCheck, Loader2, Link2, ExternalLink, Link2Off } from "lucide-react";
import { Nango } from "@nangohq/frontend";
import { deleteNangoConnection } from "@/app/(dashboard)/dashboard/settings/actions";
import { useRouter } from "next/navigation";

export function SettingsForm({ 
    initialData, 
    connections = [], 
    userId 
}: { 
    initialData?: { 
        openaiKey?: string | null, 
        anthropicKey?: string | null,
        ollamaUrl?: string | null,
        mcpUrl?: string | null,
        activeProvider?: string | null 
    } | null,
    connections?: any[],
    userId: string
}) {
    const [openaiKey, setOpenaiKey] = useState(initialData?.openaiKey || "");
    const [anthropicKey, setAnthropicKey] = useState(initialData?.anthropicKey || "");
    const [ollamaUrl, setOllamaUrl] = useState(initialData?.ollamaUrl || "http://localhost:11434");
    const [mcpUrl, setMcpUrl] = useState(initialData?.mcpUrl || "");
    const [activeProvider, setActiveProvider] = useState(initialData?.activeProvider || "cloudflare");
    const [isSaving, setIsSaving] = useState(false);
    const [isConnecting, setIsConnecting] = useState<string | null>(null);
    const router = useRouter();

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await saveUserPreferences({ 
                openaiKey, 
                anthropicKey, 
                ollamaUrl, 
                mcpUrl,
                activeProvider 
            });
            toast.success("Settings saved successfully.");
        } catch (error) {
            toast.error("Failed to save settings. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

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

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-primary" />
                        <CardTitle>Bring Your Own Key (BYOK)</CardTitle>
                    </div>
                    <CardDescription>
                        Configure your own API keys to bypass the free edge tier and unlock more capable models. Your keys are securely stored.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4 pt-4 border-t">
                        <Label className="text-base">Active AI Provider</Label>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: "cloudflare", name: "Cloudflare (Default)", desc: "Free Edge Tier" },
                                { id: "openai", name: "OpenAI", desc: "GPT-4o / GPT-4o-mini" },
                                { id: "anthropic", name: "Anthropic", desc: "Claude 3.5 Sonnet" },
                                { id: "ollama", name: "Ollama", desc: "Local Models" },
                            ].map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => setActiveProvider(p.id)}
                                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-accent ${
                                        activeProvider === p.id 
                                            ? "border-primary bg-primary/5 shadow-sm" 
                                            : "border-muted bg-background"
                                    }`}
                                >
                                    <div className="font-semibold">{p.name}</div>
                                    <div className="text-xs text-muted-foreground">{p.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <Label className="text-base text-primary">API Configuration</Label>
                        
                        <div className="space-y-2">
                            <Label htmlFor="openaiKey">OpenAI API Key</Label>
                            <Input
                                id="openaiKey"
                                type="password"
                                placeholder="sk-..."
                                value={openaiKey}
                                onChange={(e) => setOpenaiKey(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Encryption enabled. Masked once saved.</p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="anthropicKey">Anthropic API Key</Label>
                            <Input
                                id="anthropicKey"
                                type="password"
                                placeholder="sk-ant-..."
                                value={anthropicKey}
                                onChange={(e) => setAnthropicKey(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Claude models require this key.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ollamaUrl">Ollama Host URL</Label>
                            <Input
                                id="ollamaUrl"
                                placeholder="http://localhost:11434"
                                value={ollamaUrl}
                                onChange={(e) => setOllamaUrl(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Point to your local Llama-3 or Mistral instance.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mcpUrl">MCP Server URL (SSE)</Label>
                            <Input
                                id="mcpUrl"
                                placeholder="http://localhost:3001/sse"
                                value={mcpUrl}
                                onChange={(e) => setMcpUrl(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Connect to a private Model Context Protocol server.</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center bg-muted/20 border-t px-6 py-4">
                    <div className="flex items-center text-xs text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 mr-1 text-emerald-500" />
                        Stored securely in NeonDB
                    </div>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save Keys
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-primary" />
                        <CardTitle>Integrations & Connectors</CardTitle>
                    </div>
                    <CardDescription>
                        Sync your life telemetry from other apps. Debo uses this context to personalize your experience.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[
                            { id: "google-calendar", name: "Google Calendar", provider: "google" },
                            { id: "google-mail", name: "Gmail", provider: "google" },
                            { id: "slack", name: "Slack", provider: "slack" },
                            { id: "notion", name: "Notion", provider: "notion" },
                        ].map((integration) => {
                            const connected = isConnected(integration.id);
                            const loading = isConnecting === integration.id;

                            return (
                                <div
                                    key={integration.id}
                                    className="flex items-center justify-between rounded-lg border p-4 bg-background"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{integration.name}</span>
                                        <span className={`text-[10px] ${connected ? "text-emerald-500" : "text-muted-foreground"}`}>
                                            {connected ? "Connected" : "Not connected"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {connected ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDisconnect(integration.id)}
                                            >
                                                <Link2Off className="h-4 w-4 mr-1" />
                                                Disconnect
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={loading}
                                                onClick={() => handleConnect(integration.id)}
                                            >
                                                {loading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <ExternalLink className="h-4 w-4 mr-1" />
                                                        Connect
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t px-6 py-3">
                    <p className="text-[11px] text-muted-foreground">
                        Integrations powered by Nango. All data is processed securely to your private journal.
                    </p>
                </CardFooter>
            </Card>
        </form>
    );
}
