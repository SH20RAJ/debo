import { auth } from "@/lib/auth";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { headers } from "next/headers";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased">
      <Navbar isSignedIn={Boolean(session)} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
