import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>
  <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div></>;
}
