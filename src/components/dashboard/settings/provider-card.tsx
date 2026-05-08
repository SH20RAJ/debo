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
            const ok = await saveAIProvider({
                providerId: config.id,
                providerName: config.name,
                apiKey,
                baseUrl,
                isEnabled: true,
            });
            if (!ok) throw new Error("Provider settings could not be saved");
            toast.success(`${config.name} configured successfully`);
            setOpen(false);
        } catch {
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
            const ok = await setActiveProvider(config.id);
            if (!ok) throw new Error("Provider could not be set");
            toast.success(`${config.name} is now your active provider`);
        } catch {
            toast.error("Failed to set active provider");
        }
    };

    return (
        <div className={`duo-card group relative flex min-h-48 flex-col p-5 ${isActive ? 'border-duo-feather bg-duo-green/10' : ''}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-2xl border-2 border-duo-swan bg-duo-snow p-2 transition-transform group-hover:scale-105">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={config.icon} alt={config.name} className="h-full w-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="flex items-center gap-1.5 text-lg font-black text-duo-eel">
                            {config.name}
                            {isActive && <CheckCircle2 className="h-4 w-4 text-duo-green" />}
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-wider text-duo-wolf">
                            {isActive ? "Active" : "Standard"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="duolingo-outline" size="icon-xs" className="shrink-0">
                                <Settings2 className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl border-2 border-duo-swan sm:max-w-[420px]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black tracking-tight text-duo-eel">Configure {config.name}</DialogTitle>
                                <DialogDescription className="text-sm font-bold text-duo-wolf">
                                    Set your API credentials. They are encrypted before storage.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {config.id !== "cloudflare" && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="apiKey" className="text-xs font-black uppercase tracking-wider text-duo-wolf">API Key</Label>
                                        <Input
                                            id="apiKey"
                                            type="password"
                                            placeholder={savedConfig?.apiKey ? "••••••••••••••••" : "Enter API key"}
                                            value={apiKey.includes("....config") ? "" : apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            className="h-12 rounded-2xl border-2 border-duo-swan font-bold"
                                        />
                                    </div>
                                )}
                                {(config.isCustom || config.id === "ollama") && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="baseUrl" className="text-xs font-black uppercase tracking-wider text-duo-wolf">Base URL</Label>
                                        <Input
                                            id="baseUrl"
                                            placeholder="https://api.example.com/v1"
                                            value={baseUrl}
                                            onChange={(e) => setBaseUrl(e.target.value)}
                                            className="h-12 rounded-2xl border-2 border-duo-swan font-bold"
                                        />
                                    </div>
                                )}
                                {config.docsUrl && (
                                    <a 
                                        href={config.docsUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-duo-blue transition-colors hover:text-duo-humpback"
                                    >
                                        Docs <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSave} disabled={loading} variant="duolingo" className="gap-2">
                                    {loading ? "Saving..." : "Save"}
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
            <div className="mt-auto pt-5">
                <p className="line-clamp-2 text-sm font-bold leading-6 text-duo-wolf">
                    {config.description}
                </p>
            </div>
        </div>
    );
}
