import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "@/stack/client";
import "./globals.css";
import "@assistant-ui/react-ui/styles/index.css";
import "@assistant-ui/react-ui/styles/themes/shadcn-extras.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const outfit = Outfit({
	variable: "--font-outfit",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL("https://debo.app"),
	title: {
		default: "Debo | Your Life's Memory Engine",
		template: "%s | Debo",
	},
	description: "Debo is your personal memory engine. It remembers your life so you can ask anything about it. High-retention journaling and AI intelligence.",
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
			<body className={`${inter.variable} ${outfit.variable} font-sans antialiased selection:bg-primary/20 selection:text-primary`}>
				<StackProvider app={stackClientApp}>
					<StackTheme>
						<ThemeProvider
							attribute="class"
							defaultTheme="dark"
							enableSystem
							disableTransitionOnChange
						>
							<TooltipProvider>
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
