import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL("https://debo.app"),
	title: {
		default: "Debo | The AI that Remembers",
		template: "%s | Debo",
	},
	description: "Debo is your intelligent second brain. It remembers everything you forget and builds a living intelligence network from your thoughts.",
	keywords: ["Second Brain", "AI Memory", "Journaling", "Personal Intelligence", "Privacy"],
	authors: [{ name: "Debo Intelligence" }],
	creator: "Debo",
	icons: {
		icon: "/logo.png",
		shortcut: "/logo.png",
		apple: "/logo.png",
	},
	openGraph: {
		title: "Debo | The AI that Remembers",
		description: "The memory OS for thinkers. Sync your thoughts into one private intelligence network.",
		url: "https://debo.app",
		siteName: "Debo",
		images: [
			{
				url: "/logo.png",
				width: 512,
				height: 512,
				alt: "Debo Logo",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Debo | The AI that Remembers",
		description: "The memory OS for thinkers.",
		images: ["/logo.png"],
		creator: "@debo_app",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
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
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "SoftwareApplication",
							name: "Debo",
							description: "AI-powered memory OS and second brain.",
							applicationCategory: "Productivity",
							operatingSystem: "Web",
							author: {
								"@type": "Organization",
								name: "Debo Intelligence",
							},
							offers: {
								"@type": "Offer",
								price: "0",
								priceCurrency: "USD",
							},
						}),
					}}
				/>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-primary selection:text-primary-foreground`}>
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
			</body>
		</html>
	);
}
