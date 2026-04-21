"use client";

import { useState } from "react";
import { saveUserPreferences } from "@/app/(dashboard)/dashboard/settings/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, ShieldCheck, Loader2 } from "lucide-react";

export function SettingsForm({ initialData }: { 
    initialData?: { 
        openaiKey?: string | null, 
        anthropicKey?: string | null,
        ollamaUrl?: string | null,
        activeProvider?: string | null 
    } | null 
}) {
    const [openaiKey, setOpenaiKey] = useState(initialData?.openaiKey || "");
    const [anthropicKey, setAnthropicKey] = useState(initialData?.anthropicKey || "");
    const [ollamaUrl, setOllamaUrl] = useState(initialData?.ollamaUrl || "http://localhost:11434");
    const [activeProvider, setActiveProvider] = useState(initialData?.activeProvider || "cloudflare");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await saveUserPreferences({ 
                openaiKey, 
                anthropicKey, 
                ollamaUrl, 
                activeProvider 
            });
            toast.success("Settings saved successfully.");
        } catch (error) {
            toast.error("Failed to save settings. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

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
        </form>
    );
}
