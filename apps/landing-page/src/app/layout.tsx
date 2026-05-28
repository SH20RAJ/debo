import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL("https://debo.life"),
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
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Nunito+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
			</head>
			<body className="font-sans antialiased selection:bg-primary/20 selection:text-primary">
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange
				>
					<div className="min-h-screen flex flex-col bg-background">
						<Navbar />
						<main className="flex-1">{children}</main>
						<Footer />
					</div>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
