export default function SettingsPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <section className="rounded-2xl border-2 border-border bg-card p-6">
          <h2 className="font-bold mb-4">AI Provider</h2>
          <p className="text-sm text-muted-foreground">
            Configure your AI provider via environment variables.
          </p>
          <div className="mt-3 text-sm font-mono text-muted-foreground bg-muted rounded-lg p-3 space-y-1">
            <p>OPENAI_API_KEY — Your API key</p>
            <p>OPENAI_BASE_URL — API endpoint (default: NVIDIA NIM)</p>
            <p>OPENAI_MODEL — Model name (default: meta/llama-3.3-70b-instruct)</p>
          </div>
        </section>
      </div>
    </div>
  );
}
