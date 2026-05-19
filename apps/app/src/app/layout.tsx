import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { stackServerApp } from "@/stack/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Debo",
  description: "Your personal intelligence companion",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await stackServerApp.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              {children}
              <Toaster position="top-right" />
            </ThemeProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
