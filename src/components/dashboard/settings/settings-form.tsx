"use client";

import Link from "next/link";
import { type ComponentType } from "react";
import {
  Cloud,
  Images,
  Link2,
  Mic,
  Radio,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROVIDERS } from "@/config/providers";
import { CONNECTORS } from "@/config/connectors";
import { cn } from "@/lib/utils";
import { ProviderCard } from "./provider-card";

type AIProvider = {
  providerId: string;
  apiKey: string | null;
  baseUrl: string | null;
  isEnabled: boolean;
};

export function SettingsForm({
  initialData,
  aiProviders = [],
  userId,
}: {
  initialData?: {
    activeProvider?: string | null;
  } | null;
  aiProviders?: AIProvider[];
  userId: string;
}) {
  const activeProviderName =
    PROVIDERS.find((provider) => provider.id === initialData?.activeProvider)?.name || "Cloudflare";

  function getSavedConfig(providerId: string) {
    return aiProviders.find((provider) => provider.providerId === providerId);
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/connectors" className="group">
          <StatusTile
            icon={Link2}
            label="Integrations"
            value="Active"
            detail="Manage external apps"
            color="text-primary"
            className="group-hover:border-primary/30 transition-all"
          />
        </Link>
        <StatusTile
          icon={Sparkles}
          label="Model Provider"
          value={activeProviderName}
          detail="Active inference"
          color="text-primary"
        />
        <StatusTile
          icon={Cloud}
          label="Storage"
          value="Persistent"
          detail="Audio & Video R2"
          color="text-primary"
        />
      </div>

      <Tabs defaultValue="ai" className="space-y-8">
        <div className="border-b border-border">
          <TabsList className="h-auto w-full justify-start gap-8 bg-transparent p-0 rounded-none border-none">
            <SettingsTab value="ai" icon={Sparkles} label="Models" />
            <SettingsTab value="capture" icon={Video} label="Capture" />
            <SettingsTab value="voice" icon={Mic} label="Voice" />
          </TabsList>
        </div>

        <TabsContent value="ai" className="mt-0 space-y-6">
          <SectionHeader title="AI Models" text="Select the intelligence layer Debo uses for processing and memory." />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

        <TabsContent value="capture" className="mt-0 space-y-6">
          <SectionHeader title="Capture System" text="All media captures are first synced to high-speed R2 storage." />
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="grid gap-4 p-6 rounded-2xl border border-border/50 bg-card/50 sm:grid-cols-3">
              <CaptureTile icon={Mic} label="Audio" detail="Voice journals" color="text-primary" />
              <CaptureTile icon={Video} label="Video" detail="Private vlogs" color="text-primary" />
              <CaptureTile icon={Images} label="Pages" detail="Diary photos" color="text-primary" />
            </div>
            <div className="flex flex-col justify-between gap-6 p-6 rounded-2xl border border-border/50 bg-card/50">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary">
                  <Cloud className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground tracking-tight">Cloudflare R2</h3>
                <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                  Ultra-fast, globally distributed storage for all your personal media entries.
                </p>
              </div>
              <Button asChild variant="default" className="w-full gap-2 rounded-xl h-11">
                <Link href="/dashboard/capture">
                  <Video className="h-4 w-4" />
                  Launch Capture Studio
                </Link>
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="voice" className="mt-0 space-y-6">
          <SectionHeader title="Voice Intelligence" text="Interact with your memory engine via real-time voice sessions." />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 rounded-2xl border border-border/50 bg-card/50 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary">
                <Radio className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground tracking-tight">Live Session</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                  Voice-to-voice interaction that automatically indexes into your journal context.
                </p>
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-border/50 bg-card/50 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground tracking-tight">Privacy First</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                  Your voice data remains private. AI only performs actions with your explicit consent.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center border-t border-border pt-8">
        <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-6 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Data Ownership Verified
        </div>
      </div>
    </div>
  );
}

function SettingsTab({
  value,
  icon: Icon,
  label,
}: {
  value: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className="h-12 gap-2 rounded-none border-b-2 border-transparent bg-transparent px-0 text-sm font-bold uppercase tracking-widest text-muted-foreground/60 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground transition-all"
    >
      <Icon className="h-4 w-4" />
      {label}
    </TabsTrigger>
  );
}

function StatusTile({
  icon: Icon,
  label,
  value,
  detail,
  color,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  color: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4 p-6 rounded-2xl border border-border/50 bg-card/50", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted/30 shrink-0">
        <Icon className={cn("h-6 w-6", color)} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</div>
        <div className="truncate text-lg font-semibold text-foreground tracking-tight leading-tight">{value}</div>
        <div className="text-[10px] font-medium text-muted-foreground/40 mt-0.5">{detail}</div>
      </div>
    </div>
  );
}

function SectionHeader({ title, text }: { title: string; text: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h2>
      <p className="text-sm font-medium text-muted-foreground">{text}</p>
    </div>
  );
}

function CaptureTile({
  icon: Icon,
  label,
  detail,
  color,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  detail: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-muted/10 p-5 group hover:border-primary/20 transition-all">
      <Icon className={cn("mb-4 h-7 w-7 transition-transform group-hover:scale-110", color)} />
      <h3 className="text-lg font-semibold text-foreground tracking-tight">{label}</h3>
      <p className="text-xs font-medium text-muted-foreground mt-1">{detail}</p>
    </div>
  );
}
