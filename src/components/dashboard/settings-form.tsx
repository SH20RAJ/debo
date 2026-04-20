"use client";

import { useState } from "react";
import { saveUserPreferences } from "@/app/(dashboard)/dashboard/settings/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, ShieldCheck, Loader2 } from "lucide-react";

export function SettingsForm({ initialData }: { initialData?: { openaiKey?: string | null, anthropicKey?: string | null } | null }) {
    const [openaiKey, setOpenaiKey] = useState(initialData?.openaiKey || "");
    const [anthropicKey, setAnthropicKey] = useState(initialData?.anthropicKey || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await saveUserPreferences({ openaiKey, anthropicKey });
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
                    <div className="space-y-2">
                        <Label htmlFor="openaiKey">OpenAI API Key</Label>
                        <Input
                            id="openaiKey"
                            type="password"
                            placeholder="sk-..."
                            value={openaiKey}
                            onChange={(e) => setOpenaiKey(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Used for GPT-4o and other OpenAI models.</p>
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
                        <p className="text-xs text-muted-foreground">Used for Claude 3.5 Sonnet and other Anthropic models.</p>
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
