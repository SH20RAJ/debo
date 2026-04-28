"use client";

import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  BarVisualizer,
  useVoiceAssistant,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

export function LiveKitVoiceAgent() {
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/livekit/token");
      const data = await res.json() as { token?: string };
      if (data.token) {
        setToken(data.token);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  };

  const endSession = () => {
    setToken(null);
  };

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5" /> Voice Agent</CardTitle>
          <CardDescription>Start a real-time conversation with your intelligent context.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={startSession} disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Start Conversation"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5" /> Voice Agent Active</CardTitle>
        <Button variant="ghost" size="icon" onClick={endSession}><MicOff className="h-4 w-4 text-destructive" /></Button>
      </CardHeader>
      <CardContent>
        <LiveKitRoom
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://daksha-fuq54ytc.livekit.cloud"}
          token={token}
          connect={true}
          audio={true}
          video={false}
        >
          <VoiceClient />
        </LiveKitRoom>
      </CardContent>
    </Card>
  );
}

function VoiceClient() {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      <div className="flex flex-col items-center justify-center space-y-4 h-32 w-full bg-muted rounded-lg">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
          Agent State: {state || "WAITING"}
        </p>
        {audioTrack && (
          <div className="w-48 h-12 flex justify-center">
            <BarVisualizer trackRef={audioTrack} barCount={5} className="h-full" />
          </div>
        )}
      </div>
      <RoomAudioRenderer />
    </div>
  );
}
