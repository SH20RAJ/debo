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
		default: "Debo | AI Life Companion",
		template: "%s | Debo",
	},
	description: "Debo transforms simple text entries into an intelligent, context-aware AI companion using your daily journals and 130+ app connections.",
	keywords: ["Journal", "AI", "Companion", "Next.js", "Cloudflare", "Mem0"],
	authors: [{ name: "Debo Contributors" }],
	creator: "Debo",
	openGraph: {
		title: "Debo | AI Life Companion",
		description: "Your intelligent, context-aware AI companion.",
		url: "https://debo.app",
		siteName: "Debo",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Debo - AI Life Companion",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Debo | AI Life Companion",
		description: "Your intelligent, context-aware AI companion.",
		images: ["/og-image.png"],
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
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "SoftwareApplication",
							name: "Debo",
							description: "AI-powered life companion and journaling intelligence.",
							applicationCategory: "Productivity",
							operatingSystem: "Web",
							author: {
								"@type": "Organization",
								name: "Debo",
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
