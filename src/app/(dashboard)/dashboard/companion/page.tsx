import { ChatCompanion } from "@/components/dashboard/chat-companion";

export default function CompanionPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Debo Companion</h1>
                <p className="text-muted-foreground">Chat with your life assistant. It knows your past and helps with your future.</p>
            </div>

            <ChatCompanion />
        </div>
    );
}
