import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "@/stack/client";
import { StackEventTrackerGuard } from "@/components/stack-event-tracker-guard";
import "./globals.css";

import "@livekit/components-styles";

export const metadata: Metadata = {
	metadataBase: new URL("https://debo.app"),
	title: {
		default: "Debo | Private AI Memory for Your Life",
		template: "%s | Debo",
	},
	description: "Debo turns journals, voice notes, chats, and people into a private searchable memory graph with cited AI answers.",
	keywords: ["Memory Engine", "Life Querying", "Journaling", "Personal Intelligence", "Privacy"],
	authors: [{ name: "Debo" }],
	creator: "Debo",
	icons: {
		icon: "/logo.png",
		shortcut: "/logo.png",
		apple: "/logo.png",
	}
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/logo.png" />
			</head>
			<body className="font-sans antialiased selection:bg-primary/20 selection:text-primary">
				<StackProvider app={stackClientApp}>
					<StackTheme>
						<ThemeProvider
							attribute="class"
							defaultTheme="light"
							enableSystem
							disableTransitionOnChange
						>
							<TooltipProvider>
								<StackEventTrackerGuard />
								{children}
								<Toaster />
							</TooltipProvider>
						</ThemeProvider>
					</StackTheme>
				</StackProvider>
			</body>
		</html>
	);
}
