const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchApi(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  sources: {
    list: (type?: string) => fetchApi(`/api/sources${type ? `?type=${type}` : ""}`),
    get: (id: string) => fetchApi(`/api/sources/${id}`),
    create: (data: any) => fetchApi("/api/sources", { method: "POST", body: JSON.stringify(data) }),
  },
  tasks: {
    list: (status?: string) => fetchApi(`/api/tasks${status ? `?status=${status}` : ""}`),
    create: (data: any) => fetchApi("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
    approve: (id: string) => fetchApi(`/api/tasks/${id}/approve`, { method: "POST" }),
    dismiss: (id: string) => fetchApi(`/api/tasks/${id}/dismiss`, { method: "POST" }),
  },
  people: {
    list: () => fetchApi("/api/people"),
    get: (id: string) => fetchApi(`/api/people/${id}`),
  },
  projects: { list: () => fetchApi("/api/projects") },
  ask: { query: (question: string) => fetchApi("/api/ask", { method: "POST", body: JSON.stringify({ question }) }) },
  connectors: {
    list: () => fetchApi("/api/connectors"),
    connect: (provider: string) => fetchApi("/api/connectors/connect", { method: "POST", body: JSON.stringify({ provider }) }),
    disconnect: (id: string) => fetchApi(`/api/connectors/${id}`, { method: "DELETE" }),
  },
  mail: {
    getAddress: () => fetchApi("/api/mail/address"),
    checkUsername: (username: string) => fetchApi("/api/mail/address/check", { method: "POST", body: JSON.stringify({ username }) }),
    claimAddress: (username: string) => fetchApi("/api/mail/address/claim", { method: "POST", body: JSON.stringify({ username }) }),
    listThreads: (folder?: string) => fetchApi(`/api/mail/threads${folder ? `?folder=${folder}` : ""}`),
    getThread: (threadId: string) => fetchApi(`/api/mail/threads/${threadId}`),
    send: (data: { to: string; subject: string; body: string }) => fetchApi("/api/mail/send", { method: "POST", body: JSON.stringify(data) }),
    markRead: (threadId: string) => fetchApi(`/api/mail/threads/${threadId}/read`, { method: "POST" }),
    archiveThread: (threadId: string) => fetchApi(`/api/mail/threads/${threadId}/archive`, { method: "POST" }),
    deleteThread: (threadId: string) => fetchApi(`/api/mail/threads/${threadId}`, { method: "DELETE" }),
    saveToMemory: (messageId: string) => fetchApi(`/api/mail/messages/${messageId}/save-to-memory`, { method: "POST" }),
  },
  voice: {
    createSession: () => fetchApi("/api/voice/sessions", { method: "POST", body: JSON.stringify({}) }),
    getToken: (sessionId: string) => fetchApi(`/api/voice/sessions/${sessionId}/token`, { method: "POST" }),
  },
};
