"use client";

import { OAuthButtonGroup } from "@stackframe/stack";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export function JoinForm() {
  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-sm mx-auto py-32 px-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Simple Identity */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 text-primary">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-heading font-semibold text-foreground tracking-tight">
            Join Debo
          </h1>
          <p className="text-muted-foreground/60 font-medium text-sm">
            Save your memories.
          </p>
        </div>
      </div>

      {/* Main Authentication Area */}
      <div className="w-full space-y-10">
        <div className="w-full">
          <div className="[&_button]:!h-14 [&_button]:!rounded-xl [&_button]:!text-sm [&_button]:!font-bold [&_button]:!uppercase [&_button]:!tracking-widest [&_button]:!border-border/50 [&_button]:!bg-card [&_button]:!text-foreground [&_button]:hover:!bg-primary/5 [&_button]:hover:!border-primary/20 [&_button]:!transition-all [&_button]:active:!scale-95">
            <OAuthButtonGroup />
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <div className="pt-10 border-t border-border/10 w-full text-center">
        <p className="text-[10px] font-medium text-muted-foreground/20 leading-relaxed max-w-[240px] mx-auto">
          By joining, you agree to our terms.
        </p>
      </div>
    </div>
  );
}
