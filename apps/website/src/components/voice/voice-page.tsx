"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Phone, PhoneOff, Loader2, Play, Square, Headphones, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";

interface VoiceSession {
  id: string;
  roomName: string;
  status: string;
  durationSeconds: number | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

function VoiceNoteCard({ session }: { session: VoiceSession }) {
  const duration = session.durationSeconds
    ? `${Math.floor(session.durationSeconds / 60)}:${String(session.durationSeconds % 60).padStart(2, "0")}`
    : "In progress";
  const date = session.createdAt
    ? new Date(session.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <Card className="rounded-xl hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Headphones className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {session.roomName}
          </p>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
        <Badge variant={session.status === "active" ? "default" : "secondary"} className="shrink-0">
          {session.status}
        </Badge>
        <span className="text-xs text-muted-foreground shrink-0">{duration}</span>
      </CardContent>
    </Card>
  );
}

function CallRoom({ url, token, onEnd }: { url: string; token: string; onEnd: () => void }) {
  return (
    <LiveKitRoom serverUrl={url} token={token} connect={true} onDisconnected={onEnd}>
      <RoomAudioRenderer />
      <div className="text-center py-8">
        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Mic className="w-10 h-10 text-primary-foreground" />
        </div>
        <Badge variant="outline" className="mb-4">Connected</Badge>
        <p className="text-muted-foreground mb-4">Talking with Debo...</p>
        <Button onClick={onEnd} variant="destructive">
          <PhoneOff className="w-4 h-4 mr-2" />
          End Call
        </Button>
      </div>
    </LiveKitRoom>
  );
}

export function VoicePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callConnecting, setCallConnecting] = useState(false);
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [liveKitUrl, setLiveKitUrl] = useState<string | null>(null);
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Fetch sessions on mount
  useEffect(() => {
    api.voice.list()
      .then((data: any) => setSessions(data ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoadingSessions(false));
  }, []);

  const handleRecordingToggle = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      toast.success("Recording saved");
      // Refresh sessions
      api.voice.list()
        .then((data: any) => setSessions(data ?? []))
        .catch(() => {});
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          // Stop all tracks
          stream.getTracks().forEach((track) => track.stop());
          // Upload the recording
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: "audio/webm" });
          try {
            await api.media.upload(file);
            toast.success("Voice note saved to memory");
          } catch {
            toast.error("Failed to upload voice note");
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
        toast.success("Recording started");
      } catch {
        toast.error("Microphone access denied");
      }
    }
  };

  const handleStartCall = async () => {
    setCallConnecting(true);
    try {
      const result: any = await api.voice.create();
      if (result?.livekit) {
        setLiveKitUrl(result.livekit.url);
        setLiveKitToken(result.livekit.token);
        setInCall(true);
      } else {
        toast.error("LiveKit is not configured");
      }
    } catch {
      toast.error("Failed to start call");
    } finally {
      setCallConnecting(false);
    }
  };

  const handleEndCall = () => {
    setInCall(false);
    setLiveKitUrl(null);
    setLiveKitToken(null);
    // Refresh sessions
    api.voice.list()
      .then((data: any) => setSessions(data ?? []))
      .catch(() => {});
  };

  const voiceNotes = sessions.filter((s) => s.status !== "active");
  const aiCalls = sessions.filter((s) => s.status === "active");

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Voice</h1>
        <p className="text-muted-foreground mt-1">Talk to Debo or record voice notes</p>
      </div>

      {/* Record button */}
      <div className="flex flex-col items-center">
        <button
          onClick={handleRecordingToggle}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
            isRecording
              ? "bg-destructive text-destructive-foreground shadow-destructive/30 scale-110"
              : "bg-primary text-primary-foreground shadow-primary/30 hover:scale-105"
          )}
        >
          {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>
        <p className="text-sm text-muted-foreground mt-3">
          {isRecording ? "Recording... Tap to stop" : "Tap to record a voice note"}
        </p>
      </div>

      {/* Voice Call Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Voice Call with Debo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!inCall ? (
            <div className="text-center py-8">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-10 h-10 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4">Start a voice conversation with Debo</p>
              <Button onClick={handleStartCall} disabled={callConnecting}>
                {callConnecting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting...</>
                ) : (
                  "Start Call"
                )}
              </Button>
            </div>
          ) : liveKitUrl && liveKitToken ? (
            <CallRoom url={liveKitUrl} token={liveKitToken} onEnd={handleEndCall} />
          ) : null}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="voice-notes">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="voice-notes" className="flex-1">Voice Notes</TabsTrigger>
          <TabsTrigger value="ai-calls" className="flex-1">AI Calls</TabsTrigger>
          <TabsTrigger value="transcripts" className="flex-1">Transcripts</TabsTrigger>
        </TabsList>

        <TabsContent value="voice-notes">
          {loadingSessions ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading voice notes...
            </div>
          ) : voiceNotes.length > 0 ? (
            <div className="space-y-3">
              {voiceNotes.map((session) => (
                <VoiceNoteCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No voice notes yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tap the record button above to create your first voice note.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai-calls">
          {aiCalls.length > 0 ? (
            <div className="space-y-3">
              {aiCalls.map((session) => (
                <VoiceNoteCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No AI calls yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start a call to debrief your day or plan with Debo.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transcripts">
          {voiceNotes.length > 0 ? (
            <div className="space-y-3">
              {voiceNotes.slice(0, 5).map((session) => (
                <Card key={session.id} className="rounded-xl">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{session.roomName}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : "Pending"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Transcript</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Transcripts will appear here.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Completed transcriptions from your voice notes and calls.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
