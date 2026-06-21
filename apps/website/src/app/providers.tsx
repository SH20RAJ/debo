"use client";

import { StackProvider } from "@stackframe/stack";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { stackClientApp } from "@/stack/client";
import { SWRConfig } from "swr";

const STACK_CONFIGURED =
  Boolean(process.env.NEXT_PUBLIC_STACK_PROJECT_ID) &&
  process.env.NEXT_PUBLIC_STACK_PROJECT_ID !== "ffffffff-ffff-ffff-ffff-ffffffffffff";

// Global authenticated SWR fetcher
const globalFetcher = async (url: string) => {
  let token: string | null = null;
  try {
    const user = await stackClientApp.getUser();
    if (user) {
      token = await user.getAccessToken();
    }
  } catch {
    // Ignore auth error in fallback
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["x-stack-access-token"] = token;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    let body: any = null;
    try {
      body = await res.json();
    } catch {
      // ignore
    }
    const errorMsg = body?.error || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    (err as any).status = res.status;
    (err as any).info = body;
    throw err;
  }

  return res.json();
};

export function Providers({ children }: { children: React.ReactNode }) {
  const inner = (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <SWRConfig
        value={{
          fetcher: globalFetcher,
          revalidateOnFocus: true,
          revalidateOnReconnect: true,
          dedupingInterval: 3000,
        }}
      >
        <TooltipProvider>
          {children}
          <Toaster position="top-right" />
        </TooltipProvider>
      </SWRConfig>
    </ThemeProvider>
  );

  if (!STACK_CONFIGURED) return inner;

  return (
    <StackProvider app={stackClientApp}>
      {inner}
    </StackProvider>
  );
}
