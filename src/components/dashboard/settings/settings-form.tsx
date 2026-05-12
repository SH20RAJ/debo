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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/connectors" className="group">
          <StatusTile
            icon={Link2}
            label="Apps"
            value="Connect"
            detail="manage external apps"
            color="text-duo-green"
            className="group-hover:border-duo-feather transition-colors"
          />
        </Link>
        <StatusTile
          icon={Sparkles}
          label="AI"
          value={activeProviderName}
          detail="active model"
          color="text-duo-blue"
        />
        <StatusTile
          icon={Cloud}
          label="Media"
          value="R2"
          detail="audio and video storage"
          color="text-duo-orange"
        />
      </div>

      <Tabs defaultValue="ai" className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl border-2 border-duo-swan bg-duo-snow p-2 md:grid-cols-3">
          <SettingsTab value="ai" icon={Sparkles} label="AI" />
          <SettingsTab value="capture" icon={Video} label="Capture" />
          <SettingsTab value="voice" icon={Mic} label="Voice" />
        </TabsList>

        <TabsContent value="ai" className="mt-0 space-y-4">
          <SectionHeader title="AI models" text="Choose the model Debo uses." />
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

        <TabsContent value="capture" className="mt-0 space-y-4">
          <SectionHeader title="Capture" text="Audio, video, and diary pages save to R2 first." />
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className="duo-card grid gap-4 p-5 sm:grid-cols-3">
              <CaptureTile icon={Mic} label="Audio" detail="Voice journals" color="text-duo-green" />
              <CaptureTile icon={Video} label="Video" detail="Private vlogs" color="text-duo-blue" />
              <CaptureTile icon={Images} label="Pages" detail="Diary photos" color="text-duo-orange" />
            </div>
            <div className="duo-card flex flex-col justify-between gap-5 p-5">
              <div className="space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-duo-macaw bg-duo-blue/10 text-duo-blue">
                  <Cloud className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-duo-eel">Cloudflare R2</h3>
                <p className="text-sm font-bold leading-6 text-duo-wolf">
                  Stored media is linked inside the journal entry.
                </p>
              </div>
              <Button asChild variant="duolingo-macaw" className="w-full gap-2">
                <Link href="/dashboard/capture">
                  <Video className="h-4 w-4" />
                  Open Capture
                </Link>
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="voice" className="mt-0 space-y-4">
          <SectionHeader title="Voice" text="Talk to Debo with LiveKit." />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="duo-card space-y-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-duo-feather bg-duo-green/10 text-duo-green">
                <Radio className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-duo-eel">Live voice</h3>
                <p className="mt-1 text-sm font-bold leading-6 text-duo-wolf">
                  Voice sessions can become journal context.
                </p>
              </div>
            </div>
            <div className="duo-card space-y-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-duo-beetle bg-duo-purple/10 text-duo-purple">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-duo-eel">Private by default</h3>
                <p className="mt-1 text-sm font-bold leading-6 text-duo-wolf">
                  You stay in control before actions write to apps.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center border-t-2 border-duo-swan pt-6">
        <div className="flex items-center gap-2 rounded-full border-2 border-duo-swan bg-duo-snow px-4 py-2 text-xs font-black uppercase tracking-wider text-duo-wolf">
          <ShieldCheck className="h-4 w-4 text-duo-green" />
          Data stays yours
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
      className="h-12 gap-2 rounded-xl border-2 border-transparent text-sm font-black uppercase tracking-wider text-duo-wolf data-[state=active]:border-duo-swan data-[state=active]:bg-duo-polar data-[state=active]:text-duo-eel"
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
    <div className={cn("duo-card flex items-center gap-4 p-5", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-duo-swan bg-duo-polar">
        <Icon className={cn("h-6 w-6", color)} />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-black uppercase tracking-wider text-duo-wolf">{label}</div>
        <div className="truncate text-xl font-black text-duo-eel">{value}</div>
        <div className="text-xs font-bold text-duo-wolf">{detail}</div>
      </div>
    </div>
  );
}

function SectionHeader({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
      <div>
        <h2 className="text-2xl font-black text-duo-eel">{title}</h2>
        <p className="mt-1 text-sm font-bold text-duo-wolf">{text}</p>
      </div>
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
    <div className="rounded-2xl border-2 border-duo-swan bg-duo-polar p-4">
      <Icon className={cn("mb-4 h-7 w-7", color)} />
      <h3 className="text-lg font-black text-duo-eel">{label}</h3>
      <p className="text-sm font-bold text-duo-wolf">{detail}</p>
    </div>
  );
}
