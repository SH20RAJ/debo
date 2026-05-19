"use client";

import { useState } from "react";
import { X, Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MailComposeModalProps {
  open: boolean;
  onClose: () => void;
}

export function MailComposeModal({ open, onClose }: MailComposeModalProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const handleSend = async () => {
    setError("");

    if (!to.endsWith("@debo.life")) {
      setError("Debo Mail only works between Debo users. External email delivery is not supported.");
      return;
    }

    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }

    if (!body.trim()) {
      setError("Message body is required");
      return;
    }

    setSending(true);
    // Mock send
    await new Promise((r) => setTimeout(r, 500));
    setSending(false);
    setSent(true);

    setTimeout(() => {
      setSent(false);
      setTo("");
      setSubject("");
      setBody("");
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">New Debo Mail</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          {/* To */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
            <Input
              placeholder="username@debo.life"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setError("");
              }}
              className="rounded-xl"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
            <Input
              placeholder="What's this about?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Message</label>
            <textarea
              placeholder="Write your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Attach memory placeholder */}
          <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Paperclip className="w-3.5 h-3.5" />
            Attach memory or source (coming soon)
          </button>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
              <p className="text-xs text-destructive font-medium">{error}</p>
            </div>
          )}

          {/* Sent confirmation */}
          {sent && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl px-3 py-2">
              <p className="text-xs text-primary font-medium">Debo Mail sent successfully!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/30">
          <p className="text-[11px] text-muted-foreground">
            Only Debo users can message this address
          </p>
          <Button
            onClick={handleSend}
            disabled={sending || sent}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-[0_3px_0_var(--border)] px-5"
          >
            {sending ? (
              "Sending..."
            ) : sent ? (
              "Sent!"
            ) : (
              <>
                <Send className="w-3.5 h-3.5 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
