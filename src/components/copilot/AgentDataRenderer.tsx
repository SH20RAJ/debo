"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { JournalCard, TimelineCard, InsightCard } from "./renderers";
import { Sparkles } from "lucide-react";

export function AgentDataRenderer() {
  // 1. Render Journal Card
  useCopilotAction({
    name: "render_journal_card",
    description: "Render a journal entry card in the chat.",
    available: "frontend",
    parameters: [
      { name: "id", type: "string", description: "The ID of the journal entry.", required: true },
      { name: "title", type: "string", description: "The title of the journal entry.", required: true },
      { name: "content", type: "string", description: "The content snippet of the journal entry.", required: true },
      { name: "date", type: "string", description: "The date of the journal entry.", required: true },
    ],
    render: (props: any) => {
      return <JournalCard {...props.args} />;
    },
  });

  // 2. Render Timeline Card
  useCopilotAction({
    name: "render_timeline_item",
    description: "Render a specific timeline entry in the chat.",
    available: "frontend",
    parameters: [
      { name: "date", type: "string", description: "The date of the timeline entry.", required: true },
      { name: "summary", type: "string", description: "A summary of the day/period.", required: true },
      { name: "events", type: "string[]", description: "Key events during this period.", required: true },
      { name: "emotions", type: "string[]", description: "Dominant emotions.", required: false },
    ],
    render: (props: any) => {
      return <TimelineCard {...props.args} />;
    },
  });

  // 3. Render Insight Card
  useCopilotAction({
    name: "render_insight_summary",
    description: "Render a deep life insight in the chat.",
    available: "frontend",
    parameters: [
      { name: "insight", type: "string", description: "The insight text.", required: true },
      { name: "type", type: "string", description: "Type of insight (e.g., emotion, topic, pattern).", required: false },
    ],
    render: (props: any) => {
      return <InsightCard {...props.args} />;
    },
  });


  // 4. Render Voice Agent
  useCopilotAction({
    name: "render_voice_agent",
    description: "Initialize a real-time LiveKit voice conversation in the chat.",
    available: "frontend",
    parameters: [],
    render: () => {
      return (
        <div className="my-4 rounded-2xl glass-card overflow-hidden">
          <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center gap-2">
            <div className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Voice Uplink Active</span>
          </div>
          <VoiceAgentInChat />
        </div>
      );
    },
  });

  return null;
}

import { useState, useEffect } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  BarVisualizer,
  useVoiceAssistant,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";

function VoiceAgentInChat() {
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    async function getToken() {
      setIsConnecting(true);
      try {
        const res = await fetch("/api/livekit/token");
        const data = await res.json() as { token?: string };
        if (data.token) setToken(data.token);
      } catch (e) {
        console.error(e);
      } finally {
        setIsConnecting(false);
      }
    }
    getToken();
  }, []);

  if (!token) {
    return (
      <div className="p-8 flex flex-col items-center justify-center space-y-4">
        <div className="size-12 rounded-full bg-muted animate-pulse" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          {isConnecting ? "Establishing Secure Link..." : "Link Failed"}
        </p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://daksha-fuq54ytc.livekit.cloud"}
      token={token}
      connect={true}
      audio={true}
      video={false}
      className="p-6"
    >
      <VoiceClientUI onEnd={() => setToken(null)} />
    </LiveKitRoom>
  );
}

function VoiceClientUI({ onEnd }: { onEnd: () => void }) {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4 w-full h-24 bg-primary/5 rounded-xl border border-primary/10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
          {state || "INITIALIZING"}
        </p>
        {audioTrack && (
          <div className="w-32 h-8 flex justify-center">
            <BarVisualizer trackRef={audioTrack} barCount={7} className="h-full" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
         <Button 
            variant="outline" 
            size="sm" 
            onClick={onEnd}
            className="h-9 rounded-xl border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
          >
           <PhoneOff className="size-3.5 mr-2" />
           Disconnect
         </Button>
      </div>
      <RoomAudioRenderer />
    </div>
  );
}
