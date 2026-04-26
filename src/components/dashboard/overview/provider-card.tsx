"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProviderConfig } from "@/config/providers";
import { saveAIProvider, setActiveProvider } from "@/actions/settings";
import { toast } from "sonner";
import { Settings2, ExternalLink, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface ProviderCardProps {
    config: ProviderConfig;
    savedConfig?: {
        apiKey: string | null;
        baseUrl: string | null;
        isEnabled: boolean;
    };
    isActive: boolean;
}

export function ProviderCard({ config, savedConfig, isActive }: ProviderCardProps) {
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState(savedConfig?.apiKey || "");
    const [baseUrl, setBaseUrl] = useState(savedConfig?.baseUrl || config.baseUrl || "");
    const [open, setOpen] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await saveAIProvider({
                providerId: config.id,
                providerName: config.name,
                apiKey,
                baseUrl,
                isEnabled: true,
            });
            toast.success(`${config.name} configured successfully`);
            setOpen(false);
        } catch (error) {
            toast.error("Failed to save provider config");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async () => {
        if (!savedConfig?.apiKey && config.id !== "cloudflare") {
            toast.error(`Please configure ${config.name} first`);
            setOpen(true);
            return;
        }
        try {
            await setActiveProvider(config.id);
            toast.success(`${config.name} is now your active provider`);
        } catch (error) {
            toast.error("Failed to set active provider");
        }
    };

    return (
        <Card className={`group relative overflow-hidden transition-all hover:shadow-md ${isActive ? 'border-primary ring-1 ring-primary' : 'border-border/50'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg border bg-background p-1.5 transition-transform group-hover:scale-105">
                        <img src={config.icon} alt={config.name} className="h-full w-full object-contain" />
                    </div>
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {config.name}
                            {isActive && <CheckCircle2 className="h-4 w-4 text-primary fill-primary/10" />}
                        </CardTitle>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Settings2 className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Configure {config.name}</DialogTitle>
                                <DialogDescription>
                                    Set your API credentials for {config.name}. These are encrypted before storage.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {config.id !== "cloudflare" && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="apiKey">API Key</Label>
                                        <Input
                                            id="apiKey"
                                            type="password"
                                            placeholder={savedConfig?.apiKey ? "••••••••••••••••" : "Enter API key"}
                                            value={apiKey.includes("....config") ? "" : apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                        />
                                    </div>
                                )}
                                {(config.isCustom || config.id === "ollama") && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="baseUrl">Base URL</Label>
                                        <Input
                                            id="baseUrl"
                                            placeholder="https://api.example.com/v1"
                                            value={baseUrl}
                                            onChange={(e) => setBaseUrl(e.target.value)}
                                        />
                                    </div>
                                )}
                                {config.docsUrl && (
                                    <a 
                                        href={config.docsUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                                    >
                                        Where do I find my API key? <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSave} disabled={loading}>
                                    {loading ? "Saving..." : "Save Changes"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Switch 
                        checked={isActive} 
                        onCheckedChange={handleToggleActive}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-sm leading-relaxed line-clamp-2">
                    {config.description}
                </CardDescription>
            </CardContent>
        </Card>
    );
}
