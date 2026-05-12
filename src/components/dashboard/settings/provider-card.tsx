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
        <div className={`group relative flex min-h-48 flex-col p-6 rounded-2xl border transition-all duration-300 ${isActive ? 'border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(37,99,235,0.05)]' : 'border-border/50 bg-card hover:border-primary/20 hover:shadow-sm'}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/30 p-2.5 transition-transform group-hover:scale-105">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={config.icon} alt={config.name} className="h-full w-full object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground tracking-tight">
                            {config.name}
                            {isActive && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            {isActive ? "Active Connection" : "Available"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg">
                                <Settings2 className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl border border-border sm:max-w-[420px]">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold tracking-tight">Configure {config.name}</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground font-medium">
                                    Set your API credentials. They are encrypted before storage.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {config.id !== "cloudflare" && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="apiKey" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">API Key</Label>
                                        <Input
                                            id="apiKey"
                                            type="password"
                                            placeholder={savedConfig?.apiKey ? "••••••••••••••••" : "Enter API key"}
                                            value={apiKey.includes("....config") ? "" : apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            className="h-10 rounded-xl border-border bg-muted/10 font-medium"
                                        />
                                    </div>
                                )}
                                {(config.isCustom || config.id === "ollama") && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="baseUrl" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Base URL</Label>
                                        <Input
                                            id="baseUrl"
                                            placeholder="https://api.example.com/v1"
                                            value={baseUrl}
                                            onChange={(e) => setBaseUrl(e.target.value)}
                                            className="h-10 rounded-xl border-border bg-muted/10 font-medium"
                                        />
                                    </div>
                                )}
                                {config.docsUrl && (
                                    <a 
                                        href={config.docsUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                                    >
                                        Documentation <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSave} disabled={loading} className="w-full rounded-xl">
                                    {loading ? "Saving..." : "Save Configuration"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Switch 
                        checked={isActive} 
                        onCheckedChange={handleToggleActive}
                        className="scale-90"
                    />
                </div>
            </div>
            <div className="mt-auto pt-6">
                <p className="line-clamp-2 text-sm font-medium leading-relaxed text-muted-foreground/80">
                    {config.description}
                </p>
            </div>
        </div>
    );
}
