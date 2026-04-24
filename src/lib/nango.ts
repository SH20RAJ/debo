/**
 * Edge-compatible Nango Client.
 * Uses native fetch instead of @nangohq/node to avoid Node.js built-ins (like crypto).
 */

export class NangoEdge {
    private secretKey: string;
    private baseUrl = "https://api.nango.dev";

    constructor(config: { secretKey: string }) {
        this.secretKey = config.secretKey;
    }

    private get headers() {
        return {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
        };
    }

    async listConnections(connectionId: string) {
        const url = new URL(`${this.baseUrl}/connection`);
        url.searchParams.append("connectionId", connectionId);

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: this.headers,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Nango listConnections failed: ${error}`);
        }

        const data = await response.json() as { connections: any[] };
        return data.connections;
    }

    async deleteConnection(providerConfigKey: string, connectionId: string) {
        const url = new URL(`${this.baseUrl}/connection/${providerConfigKey}`);
        url.searchParams.append("connectionId", connectionId);

        const response = await fetch(url.toString(), {
            method: "DELETE",
            headers: this.headers,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Nango deleteConnection failed: ${error}`);
        }

        return true;
    }

    async proxy(config: {
        method: string;
        endpoint: string;
        providerConfigKey: string;
        connectionId: string;
        params?: Record<string, string>;
        data?: any;
    }) {
        // Ensure endpoint starts with /
        const endpoint = config.endpoint.startsWith("/") ? config.endpoint : `/${config.endpoint}`;
        const url = new URL(`${this.baseUrl}/proxy${endpoint}`);
        
        if (config.params) {
            Object.entries(config.params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }

        const response = await fetch(url.toString(), {
            method: config.method,
            headers: {
                ...this.headers,
                "Provider-Config-Key": config.providerConfigKey,
                "Connection-Id": config.connectionId,
            },
            body: config.data ? JSON.stringify(config.data) : undefined,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Nango proxy failed: ${error}`);
        }

        const data = await response.json();
        return { data };
    }
}

const nangoSecretKey = process.env.NANGO_SECRET_KEY;

if (!nangoSecretKey && process.env.NODE_ENV === "production") {
    console.warn("NANGO_SECRET_KEY is not set.");
}

export const nango = new NangoEdge({
    secretKey: nangoSecretKey || "placeholder_secret_key",
});
