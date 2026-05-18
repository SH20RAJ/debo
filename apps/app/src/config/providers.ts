export interface ProviderConfig {
    id: string;
    name: string;
    description: string;
    icon: string;
    baseUrl?: string;
    isCustom?: boolean;
    docsUrl?: string;
}

export const PROVIDERS: ProviderConfig[] = [
    {
        id: "openai",
        name: "OpenAI",
        description: "The gold standard in AI. Access GPT-4o, GPT-4 Turbo, and more.",
        icon: "https://authjs.dev/img/providers/openai.svg", // Using Auth.js as a CDN for now
        docsUrl: "https://platform.openai.com/",
    },
    {
        id: "anthropic",
        name: "Anthropic",
        description: "Focused on safety and nuanced reasoning. Access Claude 3.5 Sonnet.",
        icon: "https://www.anthropic.com/favicon.ico",
        docsUrl: "https://console.anthropic.com/",
    },
    {
        id: "groq",
        name: "Groq",
        description: "The fastest inference engine. Built for LPU technology.",
        icon: "https://groq.com/wp-content/uploads/2024/03/favicon.png",
        docsUrl: "https://console.groq.com/",
        baseUrl: "https://api.groq.com/openai/v1",
        isCustom: true,
    },
    {
        id: "ollama",
        name: "Ollama",
        description: "Run powerful LLMs locally on your own machine.",
        icon: "https://ollama.com/favicon.ico",
        docsUrl: "https://ollama.com/",
        baseUrl: "http://localhost:11434/v1",
        isCustom: true,
    },
    {
        id: "perplexity",
        name: "Perplexity",
        description: "AI-powered search engine. Perfect for real-time information.",
        icon: "https://www.perplexity.ai/favicon.ico",
        docsUrl: "https://www.perplexity.ai/settings/api",
        baseUrl: "https://api.perplexity.ai",
        isCustom: true,
    },
    {
        id: "openrouter",
        name: "OpenRouter",
        description: "A unified interface for every LLM in existence.",
        icon: "https://openrouter.ai/favicon.ico",
        docsUrl: "https://openrouter.ai/keys",
        baseUrl: "https://openrouter.ai/api/v1",
        isCustom: true,
    },
    {
        id: "cloudflare",
        name: "Cloudflare Workers AI",
        description: "Serverless GPU-powered models running on the edge.",
        icon: "https://www.cloudflare.com/favicon.ico",
        docsUrl: "https://developers.cloudflare.com/workers-ai/",
    },
    {
        id: "custom-openai",
        name: "Custom OpenAI",
        description: "Connect to any OpenAI-compatible API endpoint.",
        icon: "https://raw.githubusercontent.com/lobehub/lobe-icons/master/packages/icons/src/openai/index.tsx", // Fallback icon
        isCustom: true,
    }
];
