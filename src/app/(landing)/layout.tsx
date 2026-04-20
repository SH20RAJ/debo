export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="landing-layout min-h-screen bg-background text-foreground">
      <main className="flex-1">{children}</main>
    </div>
  );
}
