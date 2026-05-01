"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProviderConfig } from "@/config/providers";
import { saveAIProvider, setActiveProvider } from "@/actions/settings";
import { toast } from "sonner";
import { Settings2, ExternalLink, CheckCircle2 } from "lucide-react";

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
        } catch (_error) {
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
        } catch (_error) {
            toast.error("Failed to set active provider");
        }
    };

    return (
        <div className={`group relative flex flex-col rounded-2xl border transition-all hover:border-primary/20 bg-card overflow-hidden ${isActive ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-border bg-background p-2 transition-transform group-hover:scale-105">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={config.icon} alt={config.name} className="h-full w-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <div className="space-y-0.5">
                        <h3 className="text-sm font-semibold tracking-tight flex items-center gap-1.5">
                            {config.name}
                            {isActive && <CheckCircle2 className="h-3 w-3 text-primary" />}
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                            {isActive ? "Active" : "Standard"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <Settings2 className="h-3.5 w-3.5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px] border-border rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold tracking-tight">Configure {config.name}</DialogTitle>
                                <DialogDescription className="text-sm">
                                    Set your API credentials. They are encrypted before storage.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {config.id !== "cloudflare" && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="apiKey" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">API Key</Label>
                                        <Input
                                            id="apiKey"
                                            type="password"
                                            placeholder={savedConfig?.apiKey ? "••••••••••••••••" : "Enter API key"}
                                            value={apiKey.includes("....config") ? "" : apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            className="h-10 rounded-lg border-border"
                                        />
                                    </div>
                                )}
                                {(config.isCustom || config.id === "ollama") && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="baseUrl" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Base URL</Label>
                                        <Input
                                            id="baseUrl"
                                            placeholder="https://api.example.com/v1"
                                            value={baseUrl}
                                            onChange={(e) => setBaseUrl(e.target.value)}
                                            className="h-10 rounded-lg border-border"
                                        />
                                    </div>
                                )}
                                {config.docsUrl && (
                                    <a 
                                        href={config.docsUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[11px] font-medium text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
                                    >
                                        Provider Documentation <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSave} disabled={loading} className="h-10 rounded-lg text-xs font-bold uppercase tracking-wider px-6">
                                    {loading ? "Saving..." : "Save Configuration"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Switch 
                        checked={isActive} 
                        onCheckedChange={handleToggleActive}
                        className="scale-75 origin-right"
                    />
                </div>
            </div>
            <div className="px-5 pb-5 mt-auto">
                <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2">
                    {config.description}
                </p>
            </div>
        </div>
    );
}
