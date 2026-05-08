"use client";

import Link from "next/link";
import { useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import Nango from "@nangohq/frontend";
import {
  CalendarDays,
  Cloud,
  FileText,
  HardDrive,
  Images,
  Link2,
  Link2Off,
  Loader2,
  Mail,
  MessageSquare,
  Mic,
  Radio,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { deleteNangoConnection } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROVIDERS } from "@/config/providers";
import { cn } from "@/lib/utils";
import { ProviderCard } from "./provider-card";

type Connection = {
  providerConfigKey?: string;
  provider_config_key?: string;
};

type AIProvider = {
  providerId: string;
  apiKey: string | null;
  baseUrl: string | null;
  isEnabled: boolean;
};

const connectors = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    detail: "Meetings and reminders",
    icon: CalendarDays,
    color: "text-duo-blue",
    surface: "border-duo-macaw bg-duo-blue/10",
  },
  {
    id: "google-mail",
    name: "Gmail",
    detail: "Important email context",
    icon: Mail,
    color: "text-duo-red",
    surface: "border-duo-cardinal bg-duo-red/10",
  },
  {
    id: "google-photos",
    name: "Google Photos",
    detail: "Photos and videos",
    icon: Images,
    color: "text-duo-green",
    surface: "border-duo-feather bg-duo-green/10",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    detail: "Docs and files",
    icon: HardDrive,
    color: "text-duo-orange",
    surface: "border-duo-fox bg-duo-orange/10",
  },
  {
    id: "slack",
    name: "Slack",
    detail: "Team memory",
    icon: MessageSquare,
    color: "text-duo-purple",
    surface: "border-duo-beetle bg-duo-purple/10",
  },
  {
    id: "notion",
    name: "Notion",
    detail: "Notes and pages",
    icon: FileText,
    color: "text-duo-eel",
    surface: "border-duo-swan bg-duo-polar",
  },
];

export function SettingsForm({
  initialData,
  connections = [],
  aiProviders = [],
  userId,
}: {
  initialData?: {
    activeProvider?: string | null;
  } | null;
  connections?: Connection[];
  aiProviders?: AIProvider[];
  userId: string;
}) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const router = useRouter();

  const connectedCount = connectors.filter((connector) => isConnected(connector.id)).length;
  const activeProviderName =
    PROVIDERS.find((provider) => provider.id === initialData?.activeProvider)?.name || "Cloudflare";

  async function handleConnect(providerConfigKey: string) {
    if (!process.env.NEXT_PUBLIC_NANGO_PUBLIC_KEY) {
      toast.error("Nango public key is missing.");
      return;
    }

    setIsConnecting(providerConfigKey);
    try {
      const nango = new Nango({ publicKey: process.env.NEXT_PUBLIC_NANGO_PUBLIC_KEY });
      await nango.auth(providerConfigKey, userId);
      toast.success(`${getConnectorName(providerConfigKey)} connected`);
      router.refresh();
    } catch (error) {
      console.error("Nango auth error:", error);
      toast.error(`Could not connect ${getConnectorName(providerConfigKey)}.`);
    } finally {
      setIsConnecting(null);
    }
  }

  async function handleDisconnect(providerConfigKey: string) {
    setIsConnecting(providerConfigKey);
    try {
      const ok = await deleteNangoConnection(providerConfigKey);
      if (!ok) throw new Error("Disconnect failed");
      toast.success(`${getConnectorName(providerConfigKey)} disconnected`);
      router.refresh();
    } catch {
      toast.error("Could not disconnect.");
    } finally {
      setIsConnecting(null);
    }
  }

  function isConnected(provider: string) {
    return connections.some((connection) => {
      const key = connection.providerConfigKey || connection.provider_config_key;
      return key === provider;
    });
  }

  function getSavedConfig(providerId: string) {
    return aiProviders.find((provider) => provider.providerId === providerId);
  }

  function getConnectorName(providerConfigKey: string) {
    return connectors.find((connector) => connector.id === providerConfigKey)?.name || providerConfigKey;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatusTile
          icon={Link2}
          label="Apps"
          value={`${connectedCount}/${connectors.length}`}
          detail="connected"
          color="text-duo-green"
        />
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

      <Tabs defaultValue="connectors" className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl border-2 border-duo-swan bg-duo-snow p-2 md:grid-cols-4">
          <SettingsTab value="connectors" icon={Link2} label="Apps" />
          <SettingsTab value="ai" icon={Sparkles} label="AI" />
          <SettingsTab value="capture" icon={Video} label="Capture" />
          <SettingsTab value="voice" icon={Mic} label="Voice" />
        </TabsList>

        <TabsContent value="connectors" className="mt-0 space-y-4">
          <SectionHeader
            title="Connect apps"
            text="Debo can use connected apps after you approve them."
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {connectors.map((connector) => {
              const connected = isConnected(connector.id);
              const loading = isConnecting === connector.id;
              const Icon = connector.icon;

              return (
                <div key={connector.id} className="duo-card flex min-h-48 flex-col justify-between p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border-2", connector.surface)}>
                      <Icon className={cn("h-6 w-6", connector.color)} />
                    </div>
                    <span
                      className={cn(
                        "rounded-full border-2 px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                        connected
                          ? "border-duo-feather bg-duo-green/10 text-duo-green"
                          : "border-duo-swan bg-duo-polar text-duo-wolf"
                      )}
                    >
                      {connected ? "On" : "Off"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-duo-eel">{connector.name}</h3>
                    <p className="text-sm font-bold text-duo-wolf">{connector.detail}</p>
                  </div>
                  {connected ? (
                    <Button
                      type="button"
                      variant="duolingo-outline"
                      size="sm"
                      className="w-full gap-2"
                      disabled={loading}
                      onClick={() => handleDisconnect(connector.id)}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2Off className="h-4 w-4" />}
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="duolingo"
                      size="sm"
                      className="w-full gap-2"
                      disabled={loading}
                      onClick={() => handleConnect(connector.id)}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                      Connect
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

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
              <Button asChild variant="duolingo-blue" className="w-full gap-2">
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
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  color: string;
}) {
  return (
    <div className="duo-card flex items-center gap-4 p-5">
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
