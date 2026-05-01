import { stackServerApp } from "@/stack/server";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await stackServerApp.getUser();

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased">
      <Navbar isSignedIn={Boolean(user)} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
