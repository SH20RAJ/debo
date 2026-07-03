"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import {
  Lightbulb,
  Fan,
  Lock,
  Unlock,
  Thermometer,
  Plus,
  Minus,
  Settings,
  Activity,
  Cpu,
  Trash2,
  Sparkles,
  Clock,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

export function SmartHomeWidget() {
  const { data: connectors = [], mutate: mutateConnectors, isLoading } = useSWR(
    "/api/connectors",
    () => api.connectors.list()
  );

  const [activeTab, setActiveTab] = useState<"devices" | "automations">("devices");
  const [instruction, setInstruction] = useState("");
  const [addingRule, setAddingRule] = useState(false);

  const haConnector = connectors.find((c: any) => c.provider === "homeassistant");
  const isConnected = haConnector && haConnector.status === "connected";

  let metadata: any = {};
  try {
    if (haConnector?.metadataJson) {
      metadata = JSON.parse(haConnector.metadataJson);
    }
  } catch (err) {
    console.error("Failed to parse HA metadata", err);
  }

  const devices = metadata.devices || {};
  const automations = metadata.automations || [];
  const isSimulated = metadata.simulated ?? true;

  // ─── PERIODIC SCHEDULER TRIGGER ───────────────────────────────────────────
  useEffect(() => {
    if (!isConnected) return;

    const runScheduler = async () => {
      try {
        const res = await fetch("/api/connectors/homeassistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "run_scheduler" }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.triggered && data.triggered.length > 0) {
            mutateConnectors();
            data.triggered.forEach((auto: any) => {
              toast.success(`[Scheduled Automation] ${auto.description} executed!`);
            });
          }
        }
      } catch (err) {
        console.error("Scheduler evaluation failed:", err);
      }
    };

    runScheduler();
    const interval = setInterval(runScheduler, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [isConnected, mutateConnectors]);

  // ─── DEVICE DIRECT CONTROL ────────────────────────────────────────────────
  const handleControl = async (
    entityId: string,
    state: string,
    brightness?: number,
    temperature?: number
  ) => {
    const currentDevice = devices[entityId];
    if (!currentDevice) return;

    const updatedDevice = {
      ...currentDevice,
      state: entityId.startsWith("lock.")
        ? state === "lock" || state === "locked"
          ? "locked"
          : "unlocked"
        : state,
      ...(brightness !== undefined && { brightness }),
      ...(temperature !== undefined && { temperature }),
    };

    const updatedDevices = {
      ...devices,
      [entityId]: updatedDevice,
    };

    const updatedConnectors = connectors.map((c: any) => {
      if (c.provider === "homeassistant") {
        return {
          ...c,
          metadataJson: JSON.stringify({
            ...metadata,
            devices: updatedDevices,
          }),
        };
      }
      return c;
    });

    mutateConnectors(updatedConnectors, false);

    try {
      const res = await fetch("/api/connectors/homeassistant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityId, state, brightness, temperature }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update device state");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to control device");
      mutateConnectors();
    }
  };

  // ─── ADD AUTOMATION RULE ──────────────────────────────────────────────────
  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) return;

    setAddingRule(true);
    try {
      const res = await fetch("/api/connectors/homeassistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_automation",
          instruction: instruction.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to parse automation");
      }
      toast.success("AI Automation Rule created successfully!");
      setInstruction("");
      mutateConnectors();
    } catch (err: any) {
      toast.error(err.message || "Failed to create automation rule");
    } finally {
      setAddingRule(false);
    }
  };

  // ─── DELETE AUTOMATION RULE ───────────────────────────────────────────────
  const handleDeleteRule = async (id: string) => {
    try {
      const res = await fetch("/api/connectors/homeassistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_automation",
          automationId: id,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to delete rule");
      }
      toast.success("Automation rule deleted.");
      mutateConnectors();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete automation");
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 h-64 animate-pulse" />
    );
  }

  if (!isConnected) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between min-h-[220px] relative overflow-hidden group shadow-xs">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors" />
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
              🏠
            </div>
            <h3 className="font-bold text-foreground ">
              Smart Home Control
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[36ch]">
            Connect your Home Assistant or spin up a simulated smart home to control lights, climate, and locks directly from Debo.
          </p>
        </div>
        <Link href="/dashboard/connectors" className="mt-4">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-xs font-semibold py-2">
            Set up Smart Home
          </Button>
        </Link>
      </div>
    );
  }

  const livingRoomLight = devices["light.living_room"] || { state: "off", brightness: 128 };
  const kitchenFan = devices["switch.kitchen_fan"] || { state: "off" };
  const frontDoorLock = devices["lock.front_door"] || { state: "locked" };
  const thermostat = devices["climate.thermostat"] || { state: "heat", temperature: 22 };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[360px]">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

      <div className="space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
              🏠
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm ">
                Smart Home
              </h3>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                {isSimulated ? "Simulated Mode" : "Home Assistant Live"}
              </span>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-full border border-border scale-90">
            <button
              onClick={() => setActiveTab("devices")}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                activeTab === "devices"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Devices
            </button>
            <button
              onClick={() => setActiveTab("automations")}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                activeTab === "automations"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Rules ({automations.length})
            </button>
          </div>
        </div>

        {/* ─── TAB: DEVICES ───────────────────────────────────────────────────── */}
        {activeTab === "devices" && (
          <div className="grid grid-cols-2 gap-3">
            {/* Living Room Light */}
            <div className="p-3 rounded-2xl border border-border bg-background/50 hover:bg-background/80 transition-colors flex flex-col justify-between gap-3 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div
                  className={`size-8 rounded-xl flex items-center justify-center text-sm transition-all duration-300 ${
                    livingRoomLight.state === "on"
                      ? "bg-amber-100 text-amber-600 shadow-md shadow-amber-200/50"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Lightbulb className={`size-4 ${livingRoomLight.state === "on" ? "fill-amber-500" : ""}`} />
                </div>
                <Switch
                  checked={livingRoomLight.state === "on"}
                  onCheckedChange={(checked) => handleControl("light.living_room", checked ? "on" : "off")}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block truncate">
                  Living Room Light
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  {livingRoomLight.state === "on"
                    ? `On • ${Math.round(((livingRoomLight.brightness ?? 128) / 255) * 100)}%`
                    : "Off"}
                </span>
              </div>

              {livingRoomLight.state === "on" && (
                <div className="w-full pt-1">
                  <Slider
                    value={[livingRoomLight.brightness ?? 128]}
                    max={255}
                    min={10}
                    step={5}
                    onValueChange={([val]) => handleControl("light.living_room", "on", val)}
                    className="py-1 cursor-pointer [&_[data-slot=slider-range]]:bg-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Kitchen Fan */}
            <div className="p-3 rounded-2xl border border-border bg-background/50 hover:bg-background/80 transition-colors flex flex-col justify-between gap-3 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div
                  className={`size-8 rounded-xl flex items-center justify-center text-sm transition-all duration-300 ${
                    kitchenFan.state === "on"
                      ? "bg-sky-100 text-sky-600 shadow-md shadow-sky-200/50"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Fan className={`size-4 ${kitchenFan.state === "on" ? "animate-spin [animation-duration:2s]" : ""}`} />
                </div>
                <Switch
                  checked={kitchenFan.state === "on"}
                  onCheckedChange={(checked) => handleControl("switch.kitchen_fan", checked ? "on" : "off")}
                  className="data-[state=checked]:bg-sky-500"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block truncate">
                  Kitchen Fan
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  {kitchenFan.state === "on" ? "Running" : "Idle"}
                </span>
              </div>
            </div>

            {/* Front Door Lock */}
            <div className="p-3 rounded-2xl border border-border bg-background/50 hover:bg-background/80 transition-colors flex flex-col justify-between gap-3 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div
                  className={`size-8 rounded-xl flex items-center justify-center text-sm transition-all duration-300 ${
                    frontDoorLock.state === "unlocked"
                      ? "bg-green-100 text-green-600 shadow-md shadow-green-200/50"
                      : "bg-red-100 text-red-600 shadow-md shadow-red-200/50"
                  }`}
                >
                  {frontDoorLock.state === "unlocked" ? (
                    <Unlock className="size-4" />
                  ) : (
                    <Lock className="size-4" />
                  )}
                </div>
                <Switch
                  checked={frontDoorLock.state === "unlocked"}
                  onCheckedChange={(checked) =>
                    handleControl("lock.front_door", checked ? "unlock" : "lock")
                  }
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block truncate">
                  Front Door Lock
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5 capitalize">
                  {frontDoorLock.state ?? "locked"}
                </span>
              </div>
            </div>

            {/* Thermostat Climate */}
            <div className="p-3 rounded-2xl border border-border bg-background/50 hover:bg-background/80 transition-colors flex flex-col justify-between gap-2.5 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-sm shadow-md shadow-orange-200/50">
                  <Thermometer className="size-4" />
                </div>
                <span className="text-xs font-bold text-foreground">
                  {thermostat.temperature ?? 22}°C
                </span>
              </div>
              <div className="flex items-center justify-between gap-1 mt-1">
                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-foreground block truncate">
                    Thermostat
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5 capitalize">
                    {thermostat.state ?? "heat"}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleControl(
                        "climate.thermostat",
                        thermostat.state ?? "heat",
                        undefined,
                        (thermostat.temperature ?? 22) - 1
                      )
                    }
                    className="size-5 rounded-md p-0"
                  >
                    <Minus className="size-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleControl(
                        "climate.thermostat",
                        thermostat.state ?? "heat",
                        undefined,
                        (thermostat.temperature ?? 22) + 1
                      )
                    }
                    className="size-5 rounded-md p-0"
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: AUTOMATIONS ───────────────────────────────────────────────── */}
        {activeTab === "automations" && (
          <div className="space-y-3">
            {/* Rules list */}
            <div className="max-h-[170px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {automations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-2 border border-dashed border-border rounded-2xl bg-muted/10">
                  <Sparkles className="size-5 text-muted-foreground animate-pulse" />
                  <span className="text-[11px] text-muted-foreground max-w-[20ch]">
                    No smart rules set up yet. Write one below in plain English!
                  </span>
                </div>
              ) : (
                automations.map((auto: any) => (
                  <div
                    key={auto.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-background/40 hover:bg-background/80 transition-colors text-xs gap-3 group"
                  >
                    <div className="flex items-start gap-2 overflow-hidden">
                      <div className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        {auto.type === "schedule" ? (
                          <Clock className="size-3.5" />
                        ) : (
                          <BookOpen className="size-3.5" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold text-foreground block truncate">
                          {auto.description}
                        </span>
                        <span className="text-[10px] text-muted-foreground block truncate">
                          {auto.type === "schedule"
                            ? `Daily at ${auto.time}`
                            : `Triggered by keyword: "${auto.triggerKeyword}"`}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRule(auto.id)}
                      className="size-6 rounded-md hover:bg-red-50 hover:text-red-500 text-muted-foreground flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Rule builder form */}
            <form onSubmit={handleAddRule} className="flex gap-2 items-center pt-1 border-t border-border/60">
              <Input
                placeholder="e.g. turn off light at 23:00"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                disabled={addingRule}
                className="rounded-xl border-border bg-background/50 text-xs py-1.5 focus-visible:ring-primary placeholder:text-muted-foreground/60"
              />
              <Button
                type="submit"
                disabled={addingRule || !instruction.trim()}
                className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-xs font-semibold px-3 py-1.5 h-auto shadow-xs shrink-0 flex items-center gap-1"
              >
                {addingRule ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="size-3" />
                    <span>Create</span>
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Footer Settings Link */}
      {activeTab === "devices" && (
        <div className="text-[10px] text-muted-foreground/75 text-center mt-2 flex items-center justify-center gap-1">
          <Cpu className="size-3 text-primary animate-pulse" />
          <span>Ask AI in Chat to control your devices or manage rules above.</span>
        </div>
      )}
    </div>
  );
}
