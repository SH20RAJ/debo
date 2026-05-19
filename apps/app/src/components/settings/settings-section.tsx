"use client";

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="rounded-2xl border-2 border-border bg-card p-6">
      <h2 className="font-bold text-foreground mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground mb-5">{description}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
