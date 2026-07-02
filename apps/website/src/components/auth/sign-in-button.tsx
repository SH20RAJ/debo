"use client";

import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignInButton({
  callbackPath,
  children,
  className,
  disabled,
  onBeforeSignIn,
  variant = "default",
}: {
  readonly callbackPath?: string;
  readonly children?: ReactNode;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly onBeforeSignIn?: () => void;
  readonly variant?: ComponentProps<typeof Button>["variant"];
}) {
  const [pending, setPending] = useState(false);

  return (
    <Button
      aria-busy={pending}
      className={cn("gap-2", className)}
      disabled={disabled || pending}
      onClick={() => {
        setPending(true);
        onBeforeSignIn?.();
        const target = `/handler/sign-in?next=${encodeURIComponent(callbackPath || "/dashboard/agents")}`;
        window.location.href = target;
      }}
      type="button"
      variant={variant}
    >
      {pending && <Loader2Icon className="size-3.5 animate-spin" />}
      {pending ? "Opening..." : (children ?? "Sign in")}
    </Button>
  );
}
