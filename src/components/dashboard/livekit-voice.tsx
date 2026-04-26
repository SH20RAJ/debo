"use client";

import { useEffect, useState } from "react";
import {
  ControlBar,
  RoomAudioRenderer,
  SessionProvider,
  useSession,
  useAgent,
  BarVisualizer,
} from "@livekit/components-react";
import { TokenSource } from "livekit-client";
import "@livekit/components-styles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

export function LiveKitVoiceAgent() {
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      // In a real app, you would fetch this from your backend:
      // const res = await fetch("/api/livekit/token");
      // const data = await res.json();
      // setToken(data.token);
      
      // For now, using sandbox if no custom endpoint is defined
      const sandboxSource = TokenSource.sandboxTokenServer("my-debo-agent");
      setToken(sandboxSource as any); // Using any to bypass strict type here for dummy
    } catch (e) {
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
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

  // TokenSource logic for actual implementation
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5" /> Voice Agent Active</CardTitle>
      </CardHeader>
      <CardContent>
        {/* We use a string token or TokenSource depending on implementation */}
        <SessionProvider token={typeof token === "string" ? token : undefined}>
          <VoiceClient />
        </SessionProvider>
      </CardContent>
    </Card>
  );
}

function VoiceClient() {
  const session = useSession({ agentName: "debo-agent" } as any);
  
  useEffect(() => {
    session.start();
    return () => {
      session.end();
    };
  }, [session]);

  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      <AgentVisuals />
      <ControlBar controls={{ microphone: true, camera: false, screenShare: false }} />
      <RoomAudioRenderer />
    </div>
  );
}

function AgentVisuals() {
  const agent = useAgent();
  
  return (
    <div className="flex flex-col items-center justify-center space-y-4 h-32 w-full bg-muted rounded-lg">
      <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
        Agent State: {agent.state || "WAITING"}
      </p>
      {agent.canListen && agent.microphoneTrack && (
        <div className="w-48 h-12 flex justify-center">
          <BarVisualizer track={agent.microphoneTrack} state={agent.state} barCount={5} />
        </div>
      )}
    </div>
  );
}
