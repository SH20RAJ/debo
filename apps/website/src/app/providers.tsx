"use client";

import { StackProvider, StackTheme } from "@stackframe/stack";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { stackClientApp } from "@/stack/client";

const STACK_CONFIGURED =
  Boolean(process.env.NEXT_PUBLIC_STACK_PROJECT_ID) &&
  process.env.NEXT_PUBLIC_STACK_PROJECT_ID !== "ffffffff-ffff-ffff-ffff-ffffffffffff";

export function Providers({ children }: { children: React.ReactNode }) {
  const inner = (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        {children}
        <Toaster position="top-right" />
      </TooltipProvider>
    </ThemeProvider>
  );

  if (!STACK_CONFIGURED) return inner;

  return (
    <StackProvider app={stackClientApp}>
      {inner}
    </StackProvider>
  );
}
