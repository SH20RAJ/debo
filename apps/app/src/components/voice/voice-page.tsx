"use client";

import { useState } from "react";
import { Mic, Phone, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function VoicePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [inCall, setInCall] = useState(false);

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Voice</h1>
        <p className="text-muted-foreground mt-1">Talk to Debo or record voice notes</p>
      </div>

      {/* Record button */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
            isRecording
              ? "bg-destructive text-destructive-foreground shadow-destructive/30 scale-110"
              : "bg-primary text-primary-foreground shadow-primary/30 hover:scale-105"
          )}
        >
          <Mic className="w-8 h-8" />
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
              <Button onClick={() => setInCall(true)}>
                Start Call
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Mic className="w-10 h-10 text-primary-foreground" />
              </div>
              <Badge variant="outline" className="mb-4">Connected</Badge>
              <p className="text-muted-foreground mb-4">Talking with Debo...</p>
              <Button onClick={() => setInCall(false)} variant="destructive">
                <PhoneOff className="w-4 h-4 mr-2" />
                End Call
              </Button>
            </div>
          )}
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
          <div className="text-center py-12">
            <p className="text-muted-foreground">No voice notes yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tap the record button above to create your first voice note.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="ai-calls">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No AI calls yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start a call to debrief your day or plan with Debo.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="transcripts">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Transcripts will appear here.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Completed transcriptions from your voice notes and calls.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
