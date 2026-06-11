import { stackClientApp } from "@/stack/client";

/**
 * Get the current Stack Auth access token, or null when signed out.
 */
async function getAccessToken(): Promise<string | null> {
  try {
    const user = await stackClientApp.getUser();
    if (!user) return null;
    return await user.getAccessToken();
  } catch {
    return null;
  }
}

async function fetchApi(path: string, options?: RequestInit) {
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) ?? {}),
  };
  if (token) headers["x-stack-access-token"] = token;

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // ignore
    }
    const message =
      body && typeof body === "object" && body !== null && "error" in body
        ? String((body as { error: unknown }).error)
        : `http_${res.status}`;
    const err = new Error(message);
    (err as Error & { status?: number; body?: unknown }).status = res.status;
    (err as Error & { status?: number; body?: unknown }).body = body;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

type AskStreamArgs = { question: string; mode?: string; threadId?: string };

export const api = {
  sources: {
    list: (type?: string) => fetchApi(`/api/sources${type ? `?type=${type}` : ""}`),
    get: (id: string) => fetchApi(`/api/sources/${id}`),
    create: (data: { type?: string; title?: string; content?: string; description?: string; status?: string; origin?: string }) =>
      fetchApi("/api/sources", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: { title?: string; content?: string; description?: string; status?: string; metadataJson?: string }) =>
      fetchApi(`/api/sources/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi(`/api/sources/${id}`, { method: "DELETE" }),
    getFileUrl: (id: string) => fetchApi(`/api/sources/${id}/file`),
    transcribe: (id: string) =>
      fetchApi(`/api/sources/${id}/transcribe`, { method: "POST" }),
  },
  journal: {
    list: () => fetchApi("/api/sources?type=journal"),
    get: (id: string) => fetchApi(`/api/sources/${id}`),
    create: (data: { title?: string; content?: string }) =>
      fetchApi("/api/sources", {
        method: "POST",
        body: JSON.stringify({ ...data, type: "journal" }),
      }),
    update: (id: string, data: { title?: string; content?: string; metadataJson?: string }) =>
      fetchApi(`/api/sources/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  },
  tasks: {
    list: (opts?: { status?: string; extractionStatus?: string }) => {
      const params = new URLSearchParams();
      if (opts?.status) params.set("status", opts.status);
      if (opts?.extractionStatus)
        params.set("extractionStatus", opts.extractionStatus);
      const q = params.toString();
      return fetchApi(`/api/tasks${q ? `?${q}` : ""}`);
    },
    create: (data: {
      title: string;
      description?: string;
      dueAt?: string;
      status?: string;
      projectId?: string;
      relatedPersonId?: string;
    }) => fetchApi("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
    update: (
      id: string,
      data: {
        title?: string;
        description?: string;
        dueAt?: string | null;
        status?: string;
        projectId?: string | null;
        relatedPersonId?: string | null;
      },
    ) => fetchApi(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi(`/api/tasks/${id}`, { method: "DELETE" }),
    approve: (id: string) =>
      fetchApi(`/api/tasks/${id}/approve`, { method: "POST" }),
    dismiss: (id: string) =>
      fetchApi(`/api/tasks/${id}/dismiss`, { method: "POST" }),
  },
  people: {
    list: () => fetchApi("/api/people"),
    get: (id: string) => fetchApi(`/api/people/${id}`),
    create: (data: {
      name: string;
      relationship?: string;
      company?: string;
      role?: string;
      notes?: string;
    }) => fetchApi("/api/people", { method: "POST", body: JSON.stringify(data) }),
    update: (
      id: string,
      data: {
        name?: string;
        relationship?: string;
        company?: string;
        role?: string;
        notes?: string;
      },
    ) => fetchApi(`/api/people/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi(`/api/people/${id}`, { method: "DELETE" }),
  },
  projects: {
    list: (extractionStatus?: string) =>
      fetchApi(`/api/projects${extractionStatus ? `?extractionStatus=${extractionStatus}` : ""}`),
    get: (id: string) => fetchApi(`/api/projects/${id}`),
    create: (data: { name: string; description?: string; color?: string }) =>
      fetchApi("/api/projects", { method: "POST", body: JSON.stringify(data) }),
    update: (
      id: string,
      data: {
        name?: string;
        description?: string;
        color?: string;
        status?: string;
      },
    ) => fetchApi(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    archive: (id: string) => fetchApi(`/api/projects/${id}`, { method: "DELETE" }),
    approve: (id: string) => fetchApi(`/api/projects/${id}/approve`, { method: "POST" }),
    dismiss: (id: string) => fetchApi(`/api/projects/${id}/dismiss`, { method: "POST" }),
  },
  search: {
    query: (q: string, opts?: { type?: string; limit?: number }) => {
      const params = new URLSearchParams({ q });
      if (opts?.type) params.set("type", opts.type);
      if (opts?.limit) params.set("limit", String(opts.limit));
      return fetchApi(`/api/search?${params.toString()}`);
    },
  },
  vault: {
    list: () => fetchApi("/api/vault"),
    requestExport: () => fetchApi("/api/vault", { method: "POST", body: JSON.stringify({ action: "export" }) }),
  },
  decisions: {
    list: (status?: string) => fetchApi(`/api/decisions${status ? `?status=${status}` : ""}`),
    create: (data: { title: string; decisionText: string; reason?: string; status?: string; sourceId?: string; projectId?: string; confidence?: number; decidedAt?: string }) =>
      fetchApi("/api/decisions", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: { title?: string; decisionText?: string; reason?: string; status?: string }) =>
      fetchApi(`/api/decisions/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi(`/api/decisions/${id}`, { method: "DELETE" }),
  },
  extractions: {
    run: (text: string, sourceId?: string) =>
      fetchApi("/api/extractions", { method: "POST", body: JSON.stringify({ text, sourceId }) }),
  },
  ask: {
    stream: async ({ question, mode, threadId }: AskStreamArgs) => {
      const token = await getAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["x-stack-access-token"] = token;
      return fetch("/api/ask", {
        method: "POST",
        headers,
        body: JSON.stringify({ question, mode, threadId }),
      });
    },
    listThreads: () => fetchApi("/api/chat/threads"),
    getThread: (threadId: string) => fetchApi(`/api/chat/threads/${threadId}`),
    renameThread: (threadId: string, title: string) =>
      fetchApi(`/api/chat/threads/${threadId}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      }),
    deleteThread: (threadId: string) =>
      fetchApi(`/api/chat/threads/${threadId}`, { method: "DELETE" }),
  },
  connectors: {
    list: () => fetchApi("/api/connectors"),
    connect: (provider: string) =>
      fetchApi("/api/connectors/connect", {
        method: "POST",
        body: JSON.stringify({ provider }),
      }),
    disconnect: (id: string) => fetchApi(`/api/connectors/${id}`, { method: "DELETE" }),
  },
  mail: {
    getAddress: () => fetchApi("/api/mail/address"),
    checkUsername: (username: string) =>
      fetchApi("/api/mail/address/check", {
        method: "POST",
        body: JSON.stringify({ username }),
      }),
    claimAddress: (username: string) =>
      fetchApi("/api/mail/address/claim", {
        method: "POST",
        body: JSON.stringify({ username }),
      }),
    listThreads: (folder?: string) =>
      fetchApi(`/api/mail/threads${folder ? `?folder=${folder}` : ""}`),
    getThread: (threadId: string) => fetchApi(`/api/mail/threads/${threadId}`),
    send: (data: { to: string; subject: string; body: string; threadId?: string }) =>
      fetchApi("/api/mail/send", { method: "POST", body: JSON.stringify(data) }),
    markRead: (threadId: string) =>
      fetchApi(`/api/mail/threads/${threadId}/read`, { method: "POST" }),
    archiveThread: (threadId: string) =>
      fetchApi(`/api/mail/threads/${threadId}/archive`, { method: "POST" }),
    deleteThread: (threadId: string) =>
      fetchApi(`/api/mail/threads/${threadId}`, { method: "DELETE" }),
    saveToMemory: (messageId: string) =>
      fetchApi(`/api/mail/messages/${messageId}/save-to-memory`, { method: "POST" }),
  },
  voice: {
    list: () => fetchApi("/api/voice/sessions"),
    create: () => fetchApi("/api/voice/sessions", { method: "POST", body: JSON.stringify({}) }),
    getToken: (sessionId: string) =>
      fetchApi(`/api/voice/sessions/${sessionId}/token`, { method: "POST" }),
    end: (sessionId: string) =>
      fetchApi(`/api/voice/sessions/${sessionId}/end`, { method: "POST" }),
  },
  media: {
    upload: async (file: File) => {
      const token = await getAccessToken();
      const fd = new FormData();
      fd.append("file", file);
      const headers: Record<string, string> = {};
      if (token) headers["x-stack-access-token"] = token;
      const res = await fetch("/api/media/upload", { method: "POST", body: fd, headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw Object.assign(new Error(body?.error ?? `http_${res.status}`), {
          status: res.status,
          body,
        });
      }
      return res.json();
    },
  },
};
