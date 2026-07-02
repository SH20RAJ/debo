"use client";

import { SignInButton } from "@/components/auth/sign-in-button";
import { VercelIcon } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function SignInModal({
  callbackPath,
  disabled,
  onBeforeSignIn,
  onOpenChange,
  open,
}: {
  readonly callbackPath?: string;
  readonly disabled?: boolean;
  readonly onBeforeSignIn?: () => void;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex size-10 items-center justify-center rounded-full border border-border bg-muted">
            <VercelIcon className="size-4 text-foreground" />
          </div>
          <DialogTitle>Sign up or in to get started</DialogTitle>
          <DialogDescription>
            Connect your Vercel account to send messages and save sessions.
          </DialogDescription>
        </DialogHeader>
        <SignInButton
          callbackPath={callbackPath}
          className="h-11 w-full"
          disabled={disabled}
          onBeforeSignIn={onBeforeSignIn}
          variant="outline"
        >
          Continue with Vercel
        </SignInButton>
      </DialogContent>
    </Dialog>
  );
}
